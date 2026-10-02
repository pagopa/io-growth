import type { Job } from "pg-boss";

import { PgBoss } from "pg-boss";

export interface PgBossConnectionConfig {
  readonly database: string;
  readonly host: string;
  readonly password?: string;
  readonly port: number;
  readonly ssl?: boolean;
  readonly user: string;
}

export interface ScheduledJobDefinition<TData extends object = object> {
  /** Cron expression the job recurs on, evaluated in UTC unless `timezone` is set. */
  readonly cron: string;
  readonly data?: TData;
  readonly handler: ScheduledJobHandler<TData>;
  /** Unique job name — also used as the underlying pg-boss queue name. */
  readonly name: string;
  readonly timezone?: string;
}

export type ScheduledJobHandler<TData extends object> = (
  data: TData,
) => Promise<void>;

export interface Scheduler {
  /** Registers a job definition. Must be called before `start()`. */
  readonly schedule: <TData extends object = object>(
    job: ScheduledJobDefinition<TData>,
  ) => void;
  /**
   * Starts pg-boss and the workers for every registered job, after
   * reconciling the db schedules with the ones registered on this instance:
   * any db-scheduled job not registered here is unscheduled.
   */
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
}

export interface SchedulerConfig {
  readonly connection: PgBossConnectionConfig;
  readonly onEvent?: (event: unknown) => void;
  readonly pollingIntervalSeconds?: number;
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
  const boss = new PgBoss({
    database: config.connection.database,
    host: config.connection.host,
    password: config.connection.password,
    port: config.connection.port,
    ssl: config.connection.ssl ? true : undefined,
    user: config.connection.user,
  });

  boss.on("error", (error) => {
    config.onEvent?.(error);
  });

  boss.on("warning", (event) => {
    config.onEvent?.(event);
  });

  const jobs = new Map<string, ScheduledJobDefinition>();

  const schedule = <TData extends object = object>(
    job: ScheduledJobDefinition<TData>,
  ): void => {
    jobs.set(job.name, job as unknown as ScheduledJobDefinition);
  };

  const start = async (): Promise<void> => {
    await boss.start();
    await unscheduleStaleJobs(boss, new Set(jobs.keys()));

    await Promise.all(
      Array.from(jobs.values()).map(async (job) => {
        await boss.createQueue(job.name);
        await boss.schedule(job.name, job.cron, job.data ?? {}, {
          tz: job.timezone,
        });
        await boss.work(
          job.name,
          { pollingIntervalSeconds: config.pollingIntervalSeconds },
          async (pgJobs: Job[]) => {
            for (const pgJob of pgJobs) {
              await job.handler(pgJob.data);
            }
          },
        );
      }),
    );
  };

  const stop = (): Promise<void> => boss.stop();

  return { schedule, start, stop };
};
