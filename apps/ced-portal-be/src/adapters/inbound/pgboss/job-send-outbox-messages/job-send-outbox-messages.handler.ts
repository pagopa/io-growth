import type { Scheduler } from "@pagopa/io-core-adapter-pgboss";

import { JobSendOutboxMessagesUseCase } from "../../../../application/use-cases/jobs/job-send-outbox-messages.use-case.js";

export const JOB_SEND_OUTBOX_MESSAGES_NAME = "job-send-outbox-messages";

export const mountJobSendOutboxMessagesHandler = (
  scheduler: Scheduler,
  useCase: JobSendOutboxMessagesUseCase,
): void => {
  scheduler.schedule({
    cron: "*/5 * * * *", // every 5 minutes
    handler: async () => {
      const result = await useCase({});
      if (result.isErr()) {
        throw result.error;
      }
    },
    name: JOB_SEND_OUTBOX_MESSAGES_NAME,
    timezone: "Europe/Rome",
  });
};
