import type { Job } from "pg-boss";

import { PgBoss } from "pg-boss";

const DEFAULT_OWNERSHIP_CHECK_SECONDS = 15;
const DEFAULT_STOP_TIMEOUT_SECONDS = 25;
// Gives the owner revision time to take over a job fenced off from an old one.
const QUEUE_RETRY_DELAY_SECONDS = 30;
const QUEUE_HEARTBEAT_SECONDS = 30;
const TRACING_CALLER = "JobsScheduler";

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
   * Starts pg-boss and the workers for every registered job after unscheduling
   * the db schedules not registered here. When `isOwned` is configured, this
   * only happens while it resolves to true; otherwise the scheduler stays
   * passive and never touches the schedules.
   */
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
}

export interface SchedulerConfig {
  readonly connection: PgBossConnectionConfig;
  /** Included in every traced event to tell apart schedulers sharing a process. */
  readonly environment?: string;
  /** Label for this pg-boss instance, passed through as is. */
  readonly instanceName?: string;
  /**
   * Tells whether this scheduler currently owns the jobs. Without it, the
   * scheduler always runs, as when each deploy stops the previous version.
   */
  readonly isOwned?: () => Promise<boolean>;
  /** How often ownership is re-checked; only used with `isOwned`. */
  readonly ownershipCheckSeconds?: number;
  readonly pollingIntervalSeconds?: number;
  /** Max time active jobs may take to finish on stop or demotion. */
  readonly stopTimeoutSeconds?: number;
  readonly tracingRepository?: SchedulerTracingRepository;
}

/** Best-effort telemetry sink; implementations must never throw. */
export interface SchedulerTracingRepository {
  readonly emitEvent: (
    name: string,
    payload: { readonly caller: string; readonly data: unknown },
  ) => void;
}

type DemotionTrigger = "job_fence" | "ownership_check";

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
  const { isOwned } = config;
  const ownershipCheckMs =
    (config.ownershipCheckSeconds ?? DEFAULT_OWNERSHIP_CHECK_SECONDS) * 1000;
  const stopTimeoutMs =
    (config.stopTimeoutSeconds ?? DEFAULT_STOP_TIMEOUT_SECONDS) * 1000;

  const jobs = new Map<string, ScheduledJobDefinition>();
  // Defined only while this revision runs as the owner.
  let boss: PgBoss | undefined;
  let ownershipTimer: NodeJS.Timeout | undefined;
  let reconcileInFlight: Promise<void> | undefined;
  let stopped = false;

  const emitEvent = (
    name: string,
    data: Record<string, unknown> = {},
  ): void => {
    config.tracingRepository?.emitEvent(name, {
      caller: TRACING_CALLER,
      data: {
        environment: config.environment,
        ...data,
      },
    });
  };

  // Raw pg-boss errors/warnings and failed ownership checks.
  const emitError = (event: unknown): void => {
    emitEvent("scheduler.event", { event });
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

  const demote = async (trigger: DemotionTrigger): Promise<void> => {
    // Already stopped, e.g. by another worker's fence: report the demotion once.
    if (!boss) {
      return;
    }
    emitEvent("scheduler.demoted", { trigger });
    await stopBoss();
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
        // Closes the gap before the next ownership check notices the loss.
        if (isOwned && !(await isOwned())) {
          emitEvent("scheduler.job_rejected", { job: job.name });
          void demote("job_fence").catch(emitError);
          throw new Error("Scheduler no longer owns scheduled jobs");
        }
        for (const pgJob of pgJobs) {
          try {
            await job.handler(pgJob.data, { signal: pgJob.signal });
          } catch (error) {
            emitEvent("scheduler.job_failed", {
              error:
                error instanceof Error
                  ? { message: error.message, name: error.name }
                  : String(error),
              job: job.name,
              jobId: pgJob.id,
            });
            throw error;
          }
        }
      },
    );
  };

  const startAsOwner = async (): Promise<void> => {
    const instance = new PgBoss({
      database: config.connection.database,
      host: config.connection.host,
      ...(config.instanceName === undefined
        ? {}
        : { instanceName: config.instanceName }),
      password: config.connection.password,
      port: config.connection.port,
      ssl: config.connection.ssl ? true : undefined,
      user: config.connection.user,
    });
    instance.on("error", emitError);
    instance.on("warning", emitError);
    boss = instance;

    try {
      await instance.start();
      await unscheduleStaleJobs(instance, new Set(jobs.keys()));
      await Promise.all(
        Array.from(jobs.values()).map((job) => registerWorker(instance, job)),
      );
    } catch (error) {
      await stopBoss().catch(emitError);
      throw error;
    }
  };

  // Never rejects: failures are traced, so stop() can safely await it.
  const runReconcile = async (check: () => Promise<boolean>): Promise<void> => {
    try {
      const owner = await check();
      // stop() may have run while the check was pending.
      if (stopped) {
        return;
      }
      if (owner && !boss) {
        await startAsOwner();
        emitEvent("scheduler.promoted");
      } else if (!owner && boss) {
        await demote("ownership_check");
      }
    } catch (error) {
      emitError(error);
    }
  };

  const reconcile = async (): Promise<void> => {
    if (!isOwned || reconcileInFlight || stopped) {
      return;
    }
    reconcileInFlight = runReconcile(isOwned).finally(() => {
      reconcileInFlight = undefined;
    });
    await reconcileInFlight;
  };

  const start = async (): Promise<void> => {
    const role = !isOwned || (await isOwned()) ? "owner" : "passive";
    if (stopped) {
      return;
    }
    if (role === "owner") {
      await startAsOwner();
    }
    emitEvent("scheduler.started", { role });
    if (!isOwned) {
      return;
    }
    // Keeps ticking while passive too, so a later promotion needs no restart.
    ownershipTimer = setInterval(() => {
      void reconcile();
    }, ownershipCheckMs);
    ownershipTimer.unref();
  };

  const stop = async (): Promise<void> => {
    if (stopped) {
      return;
    }
    stopped = true;
    clearInterval(ownershipTimer);
    // Lets a promotion already underway finish, so its pg-boss gets stopped.
    await reconcileInFlight;
    emitEvent("scheduler.stopped", { role: boss ? "owner" : "passive" });
    await stopBoss();
  };

  return { schedule, start, stop };
};
