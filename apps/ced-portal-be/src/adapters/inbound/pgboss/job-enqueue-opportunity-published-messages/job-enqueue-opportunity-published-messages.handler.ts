import type { Scheduler } from "@pagopa/io-core-adapter-pgboss";

import { JobEnqueueOpportunityPublishedMessagesUseCase } from "../../../../application/use-cases/jobs/job-enqueue-opportunity-published-messages.use-case.js";

export const JOB_ENQUEUE_OPPORTUNITY_PUBLISHED_MESSAGES_NAME =
  "job-enqueue-opportunity-published-messages";

export const mountJobEnqueueOpportunityPublishedMessagesHandler = (
  scheduler: Scheduler,
  useCase: JobEnqueueOpportunityPublishedMessagesUseCase,
): void => {
  scheduler.schedule({
    // Minutes 2, 17, 32, 47: just after the 15-minute materialized view refresh.
    cron: "2-59/15 * * * *",
    handler: async () => {
      const result = await useCase({});
      if (result.isErr()) {
        throw result.error;
      }
    },
    name: JOB_ENQUEUE_OPPORTUNITY_PUBLISHED_MESSAGES_NAME,
    timezone: "Europe/Rome",
  });
};
