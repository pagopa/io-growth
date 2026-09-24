import type {
  PgBossConnectionConfig,
  ScheduledJobDefinition,
} from "@pagopa/io-core-adapter-pgboss";

import { createScheduler } from "@pagopa/io-core-adapter-pgboss";
import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";

import {
  createTypedDbClient,
  TypedDbClient,
} from "../../../packages/io-core-adapter-drizzle/dist/client.js";
import { mountTestJobHandler } from "./adapters/inbound/pgboss/test-job/test-job.handler.js";
import { createDrizzleOpportunityRepository } from "./adapters/outbound/drizzle/drizzle-opportunity.repository.js";
import * as schema from "./adapters/outbound/drizzle/schema/index.js";
import { makeTestJobUseCase } from "./application/use-cases/jobs/test-job.use-case.js";
import { AppConfig } from "./config.js";
import { JobEnvironment } from "./domain/entities/job.js";

interface Scheduler {
  dbClient: TypedDbClient<typeof schema>;
  environment: JobEnvironment;
  schedule: <TData extends object = object>(
    job: ScheduledJobDefinition<TData>,
  ) => void;
  start: () => Promise<void>;
  stop: () => Promise<void>;
}

// Create and configure the environment-specific schedulers (prod and test)
export const jobsScheduler = (config: AppConfig) => {
  const sharedDbConnection = {
    host: config.POSTGRES_HOST,
    password: config.POSTGRES_PASSWORD,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    user: config.POSTGRES_USER,
  };

  const scheduleJobs = (scheduler: Scheduler): void => {
    jobRegistrations.forEach((mountTo) => mountTo(scheduler));
  };

  const createEnvScheduler = (
    connection: PgBossConnectionConfig,
    environment: JobEnvironment,
    pollingIntervalSeconds: number,
  ): Scheduler => {
    const pgBossScheduler = createScheduler({
      connection,
      onEvent: (event) => {
        emitCustomEvent("scheduler.event", {
          caller: "JobsScheduler",
          data: { event },
        })("JobsScheduler");
      },
      pollingIntervalSeconds,
    });

    const dbClient = createTypedDbClient(connection, schema);

    return {
      dbClient,
      environment,
      schedule: pgBossScheduler.schedule,
      start: pgBossScheduler.start,
      stop: async () => {
        await pgBossScheduler.stop();
        await dbClient.closeConnection();
      },
    };
  };

  const prodScheduler = createEnvScheduler(
    { ...sharedDbConnection, database: config.POSTGRES_DB },
    "prod",
    config.SCHEDULER_POLLING_INTERVAL_SECONDS,
  );

  const testScheduler = createEnvScheduler(
    {
      ...sharedDbConnection,
      database: config.POSTGRES_DB_TEST || config.POSTGRES_DB,
    },
    "test",
    config.SCHEDULER_POLLING_INTERVAL_SECONDS,
  );

  scheduleJobs(prodScheduler);
  scheduleJobs(testScheduler);

  return {
    start: async () => {
      await Promise.all([prodScheduler.start(), testScheduler.start()]);
    },

    stop: async () => {
      await Promise.all([prodScheduler.stop(), testScheduler.stop()]);
    },
  };
};

// Define Jobs with their dependencies and mount them to the scheduler
const makeTestJob = (scheduler: Scheduler): void => {
  const opportunityRepository = createDrizzleOpportunityRepository(
    scheduler.dbClient,
  );
  const useCase = makeTestJobUseCase(
    scheduler.environment,
    opportunityRepository,
  );

  mountTestJobHandler(scheduler, useCase);
};

// Register every job here
const jobRegistrations: ((scheduler: Scheduler) => void)[] = [makeTestJob];
