import type { Job } from "pg-boss";

import { PgBoss } from "pg-boss";

import { createRevisionRegistry } from "./revision-registry.js";

const DEFAULT_OWNERSHIP_CHECK_SECONDS = 15;
const DEFAULT_STOP_TIMEOUT_SECONDS = 25;
// Gives the owner revision time to take over a job fenced off from an old one.
const QUEUE_RETRY_DELAY_SECONDS = 30;
const QUEUE_HEARTBEAT_SECONDS = 30;

export interface PgBossConnectionConfig {
  readonly database: string;
  readonly host: string;
  readonly password?: string;
  readonly port: number;
  readonly ssl?: boolean;
  readonly user: string;
}

export interface ScheduledJobContext {
  /** Aborted when pg-boss shuts down or the job attempt is no longer ours. */
  readonly signal: AbortSignal;
}

export interface ScheduledJobDefinition<TData extends object = object> {
  /** Cron expression the job recurs on, evaluated in UTC unless `timezone` is set. */
  readonly cron: string;
  readonly data?: TData;
  /** Upper bound of a single run; defaults to the pg-boss queue default (15 minutes). */
  readonly expireInSeconds?: number;
  readonly handler: ScheduledJobHandler<TData>;
  /** Unique job name — also used as the underlying pg-boss queue name. */
  readonly name: string;
  readonly timezone?: string;
}

export type ScheduledJobHandler<TData extends object> = (
  data: TData,
  context: ScheduledJobContext,
) => Promise<void>;

export interface Scheduler {
  /** Registers a job definition. Must be called before `start()`. */
  readonly schedule: <TData extends object = object>(
    job: ScheduledJobDefinition<TData>,
  ) => void;
  /**
   * Registers this revision and, only if it is the latest one, starts pg-boss
   * and the workers for every registered job after unscheduling the db
   * schedules not registered here. Older revisions stay passive and never
   * touch the schedules.
   */
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
}

export interface SchedulerConfig {
  readonly connection: PgBossConnectionConfig;
  readonly onEvent?: (event: unknown) => void;
  /** How often a revision re-checks whether it still owns the jobs. */
  readonly ownershipCheckSeconds?: number;
  readonly pollingIntervalSeconds?: number;
  /** Identifies the deployed revision; the latest one to register owns the jobs. */
  readonly revision: string;
  /** Max time active jobs may take to finish on stop or demotion. */
  readonly stopTimeoutSeconds?: number;
}

const unscheduleStaleJobs = async (
  boss: PgBoss,
  registeredJobNames: ReadonlySet<string>,
): Promise<void> => {
  const existingSchedules = await boss.getSchedules();
  const staleSchedules = existingSchedules.filter(
    (existing) => !registeredJobNames.has(existing.name),
  );
  await Promise.all(staleSchedules.map((stale) => boss.unschedule(stale.name)));
};

export const createScheduler = (config: SchedulerConfig): Scheduler => {
  const registry = createRevisionRegistry(config.connection, config.revision);
  const ownershipCheckMs =
    (config.ownershipCheckSeconds ?? DEFAULT_OWNERSHIP_CHECK_SECONDS) * 1000;
  const stopTimeoutMs =
    (config.stopTimeoutSeconds ?? DEFAULT_STOP_TIMEOUT_SECONDS) * 1000;

  const jobs = new Map<string, ScheduledJobDefinition>();
  // Defined only while this revision runs as the owner.
  let boss: PgBoss | undefined;
  let ownershipTimer: NodeJS.Timeout | undefined;
  let reconciling = false;
  let stopped = false;

  const emit = (event: unknown): void => {
    config.onEvent?.(event);
  };

  const schedule = <TData extends object = object>(
    job: ScheduledJobDefinition<TData>,
  ): void => {
    jobs.set(job.name, job as unknown as ScheduledJobDefinition);
  };

  const stopBoss = async (): Promise<void> => {
    const instance = boss;
    boss = undefined;
    if (!instance) {
      return;
    }
    await instance.stop({ graceful: true, timeout: stopTimeoutMs });
  };

  const registerWorker = async (
    instance: PgBoss,
    job: ScheduledJobDefinition,
  ): Promise<void> => {
    const queueOptions = {
      heartbeatSeconds: QUEUE_HEARTBEAT_SECONDS,
      retryDelay: QUEUE_RETRY_DELAY_SECONDS,
      ...(job.expireInSeconds === undefined
        ? {}
        : { expireInSeconds: job.expireInSeconds }),
    };
    await instance.createQueue(job.name, queueOptions);
    // createQueue leaves an existing queue untouched, so apply option changes.
    await instance.updateQueue(job.name, queueOptions);
    await instance.schedule(job.name, job.cron, job.data ?? {}, {
      tz: job.timezone,
    });
    await instance.work(
      job.name,
      { pollingIntervalSeconds: config.pollingIntervalSeconds },
      async (pgJobs: Job[]) => {
        // Closes the gap before the next ownership check notices a newer revision.
        if (!(await registry.isOwner())) {
          void stopBoss().catch(emit);
          throw new Error(
            `Revision ${config.revision} no longer owns scheduled jobs`,
          );
        }
        for (const pgJob of pgJobs) {
          await job.handler(pgJob.data, { signal: pgJob.signal });
        }
      },
    );
  };

  const startAsOwner = async (): Promise<void> => {
    const instance = new PgBoss({
      database: config.connection.database,
      host: config.connection.host,
      instanceName: config.revision,
      password: config.connection.password,
      port: config.connection.port,
      ssl: config.connection.ssl ? true : undefined,
      user: config.connection.user,
    });
    instance.on("error", emit);
    instance.on("warning", emit);
    boss = instance;

    try {
      await instance.start();
      await unscheduleStaleJobs(instance, new Set(jobs.keys()));
      await Promise.all(
        Array.from(jobs.values()).map((job) => registerWorker(instance, job)),
      );
    } catch (error) {
      await stopBoss().catch(emit);
      throw error;
    }
  };

  const reconcile = async (): Promise<void> => {
    if (reconciling || stopped) {
      return;
    }
    reconciling = true;
    try {
      const owner = await registry.isOwner();
      if (owner && !boss) {
        await startAsOwner();
      } else if (!owner && boss) {
        await stopBoss();
      }
    } catch (error) {
      emit(error);
    } finally {
      reconciling = false;
    }
  };

  const start = async (): Promise<void> => {
    await registry.ensureTable();
    await registry.claim();
    if (await registry.isOwner()) {
      await startAsOwner();
    }
    // Keeps ticking while passive too, so a manual registry reset needs no restart.
    ownershipTimer = setInterval(() => {
      void reconcile();
    }, ownershipCheckMs);
    ownershipTimer.unref();
  };

  const stop = async (): Promise<void> => {
    stopped = true;
    clearInterval(ownershipTimer);
    try {
      await stopBoss();
    } finally {
      await registry.close();
    }
  };

  return { schedule, start, stop };
};
