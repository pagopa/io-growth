import type { TypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import type {
  PgBossConnectionConfig,
  ScheduledJobDefinition,
} from "@pagopa/io-core-adapter-pgboss";

import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import { createScheduler } from "@pagopa/io-core-adapter-pgboss";
import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";

import { mountJobEnqueueOpportunityPublishedMessagesHandler } from "./adapters/inbound/pgboss/job-enqueue-opportunity-published-messages/job-enqueue-opportunity-published-messages.handler.js";
import { mountJobSendOutboxMessagesHandler } from "./adapters/inbound/pgboss/job-send-outbox-messages/job-send-outbox-messages.handler.js";
import { createDrizzleMessageOutboxRepository } from "./adapters/outbound/drizzle/drizzle-message-outbox.repository.js";
import { createDrizzleOpportunityNotificationRepository } from "./adapters/outbound/drizzle/drizzle-opportunity-notification.repository.js";
import * as schema from "./adapters/outbound/drizzle/schema/index.js";
import { makeJobEnqueueOpportunityPublishedMessagesUseCase } from "./application/use-cases/jobs/job-enqueue-opportunity-published-messages.use-case.js";
import { makeJobSendOutboxMessagesUseCase } from "./application/use-cases/jobs/job-send-outbox-messages.use-case.js";
import { AppConfig } from "./config.js";
import { JobEnvironment } from "./domain/entities/job.js";
import { EmailRepository } from "./domain/ports/outbound/email.repository.js";
import { TracingRepository } from "./domain/ports/outbound/tracing.repository.js";

interface JobsDependencies {
  emailRepository: EmailRepository;
  tracingRepository: TracingRepository;
}

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
export const jobsScheduler = (
  config: AppConfig,
  dependencies: JobsDependencies,
) => {
  const sharedDbConnection = {
    host: config.POSTGRES_HOST,
    password: config.POSTGRES_PASSWORD,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    user: config.POSTGRES_USER,
  };

  const scheduleJobs = (scheduler: Scheduler): void => {
    jobRegistrations.forEach((mountTo) => mountTo(scheduler, dependencies));
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
      ownershipCheckSeconds: config.SCHEDULER_OWNERSHIP_CHECK_SECONDS,
      pollingIntervalSeconds,
      revision: config.CONTAINER_APP_REVISION,
      stopTimeoutSeconds: config.SCHEDULER_STOP_TIMEOUT_SECONDS,
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
const makeJobEnqueueOpportunityPublishedMessages = (
  scheduler: Scheduler,
  { tracingRepository }: JobsDependencies,
): void => {
  const useCase = makeJobEnqueueOpportunityPublishedMessagesUseCase(
    scheduler.environment,
    createDrizzleOpportunityNotificationRepository(scheduler.dbClient),
    tracingRepository,
  );

  mountJobEnqueueOpportunityPublishedMessagesHandler(scheduler, useCase);
};
const makeJobSendOutboxMessages = (
  scheduler: Scheduler,
  { emailRepository, tracingRepository }: JobsDependencies,
): void => {
  const useCase = makeJobSendOutboxMessagesUseCase(
    scheduler.environment,
    createDrizzleMessageOutboxRepository(scheduler.dbClient),
    emailRepository,
    tracingRepository,
  );

  mountJobSendOutboxMessagesHandler(scheduler, useCase);
};

// Register every job here
const jobRegistrations: ((
  scheduler: Scheduler,
  dependencies: JobsDependencies,
) => void)[] = [
  makeJobSendOutboxMessages,
  makeJobEnqueueOpportunityPublishedMessages,
];
