import type { GenericError, UseCase } from "@pagopa/io-core-domain";

import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { ResultAsync } from "neverthrow";

import { JobEnvironment } from "../../../domain/entities/job.js";
import { OpportunityRepository } from "../../../domain/ports/outbound/persistence/opportunity.repository.js";
import { executeWithTracing } from "../utils/trace-use-case.js";

export type TestJobUseCase = UseCase<Record<string, never>, void, GenericError>;

const TEST_JOB_USE_CASE = "TestJobUseCase";

export const makeTestJobUseCase =
  (
    environment: JobEnvironment,
    opportunityRepository: OpportunityRepository,
  ): TestJobUseCase =>
  async () =>
    executeWithTracing(
      async () =>
        new ResultAsync(
          opportunityRepository.findAll({
            limit: 100,
            offset: 0,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
        ).map((res) => {
          emitCustomEvent("jobs.test", {
            caller: TEST_JOB_USE_CASE,
            data: { env: environment, items: res.items.length },
          })(TEST_JOB_USE_CASE);
        }),
      TEST_JOB_USE_CASE,
      environment,
    );
