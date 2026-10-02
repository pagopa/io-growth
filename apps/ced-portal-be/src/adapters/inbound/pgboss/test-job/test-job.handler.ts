import type { Scheduler } from "@pagopa/io-core-adapter-pgboss";

import { TestJobUseCase } from "../../../../application/use-cases/jobs/test-job.use-case.js";

export const TEST_JOB_NAME = "test-job";

export const mountTestJobHandler = (
  scheduler: Scheduler,
  useCase: TestJobUseCase,
): void => {
  scheduler.schedule({
    cron: "* * * * *", // every minute
    handler: async () => {
      const result = await useCase({});
      if (result.isErr()) {
        throw result.error;
      }
    },
    name: TEST_JOB_NAME,
    timezone: "Europe/Rome",
  });
};
