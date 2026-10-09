import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { err, ok, type Result } from "neverthrow";

import type { OpportunityNotificationRepository } from "../../../domain/ports/outbound/persistence/opportunity-notification.repository.js";
import type { TracingRepository } from "../../../domain/ports/outbound/tracing.repository.js";

import { JobEnvironment } from "../../../domain/entities/job.js";

export type JobEnqueueOpportunityPublishedMessagesUseCase = UseCase<
  Record<string, never>,
  void,
  GenericError
>;

const JOB_ENQUEUE_OPPORTUNITY_PUBLISHED_MESSAGES_USE_CASE =
  "JobEnqueueOpportunityPublishedMessagesUseCase";

const BATCH_SIZE = 500;

export const makeJobEnqueueOpportunityPublishedMessagesUseCase =
  (
    environment: JobEnvironment,
    opportunityNotificationRepository: OpportunityNotificationRepository,
    tracingRepository: TracingRepository,
  ): JobEnqueueOpportunityPublishedMessagesUseCase =>
  async () =>
    tracingRepository.traceExecution(
      async (): Promise<Result<void, GenericError>> => {
        let total = 0;
        let notified = BATCH_SIZE;

        while (notified === BATCH_SIZE) {
          const result =
            await opportunityNotificationRepository.enqueuePublishedMessages(
              BATCH_SIZE,
            );
          if (result.isErr()) return err(result.error);
          notified = result.value;
          total += notified;
        }

        tracingRepository.emitEvent("jobs.opportunity-published.enqueued", {
          caller: JOB_ENQUEUE_OPPORTUNITY_PUBLISHED_MESSAGES_USE_CASE,
          data: { count: total, env: environment },
        });
        return ok(undefined);
      },
      JOB_ENQUEUE_OPPORTUNITY_PUBLISHED_MESSAGES_USE_CASE,
      environment,
    );
