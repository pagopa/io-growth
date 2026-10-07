import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import {
  GenericError,
  PreconditionFailedError,
} from "@pagopa/io-core-domain/errors";
import { errAsync, okAsync, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { MaterializedViewRepository } from "../../../domain/ports/outbound/materialized-view.repository.js";
import type { OnboardingRepository } from "../../../domain/ports/outbound/onboarding.repository.js";
import type { OperatorRepository } from "../../../domain/ports/outbound/persistence/operator.repository.js";
import type { SessionRepository } from "../../../domain/ports/outbound/persistence/session.repository.js";

import { ONBOARDING_STATUS } from "../../../domain/entities/onboarding.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

const CASCADE_SUSPENSION_MESSAGE =
  "Opportunity suspended following the revocation of the operator's contract";

const AdminRevokeOperatorInputSchema = z.object({
  onboardingId: z.string().min(1),
  revocationMessage: z.string().trim().min(1).max(4096).optional(),
});

export type AdminRevokeOperatorInput = z.infer<
  typeof AdminRevokeOperatorInputSchema
>;

export type AdminRevokeOperatorUseCase = UseCase<
  AdminRevokeOperatorInput,
  void,
  BaseError
>;

export const makeAdminRevokeOperatorUseCase =
  (deps: {
    arOnboardingRepository: Pick<
      OnboardingRepository,
      "deleteOnboarding" | "getById"
    >;
    materializedViewRepository: MaterializedViewRepository;
    operatorRepository: Pick<
      OperatorRepository,
      "getByExternalId" | "revokeById"
    >;
    sessionRepository: Pick<SessionRepository, "revokeByOperatorExternalId">;
  }): AdminRevokeOperatorUseCase =>
  async (input) =>
    validateUseCaseInput(AdminRevokeOperatorInputSchema, input).andThen((v) =>
      new ResultAsync(deps.arOnboardingRepository.getById(v.onboardingId))
        .andThen((onboarding) => {
          if (onboarding.status !== ONBOARDING_STATUS.COMPLETED) {
            return errAsync(
              new PreconditionFailedError(
                "Only a completed onboarding can be revoked: a request that is not yet completed is rejected, not revoked",
              ),
            );
          }
          // Both identifiers are optional in the AR contract. Without the
          // institution id there is no key for the tombstone and no way to
          // resolve the operator row, so the revocation cannot proceed.
          const operatorExternalId = onboarding.institution?.id;
          return operatorExternalId
            ? okAsync(operatorExternalId)
            : errAsync(
                new GenericError(
                  `Onboarding ${v.onboardingId} carries no institution id`,
                ),
              );
        })
        .andThen((operatorExternalId) =>
          new ResultAsync(
            deps.arOnboardingRepository.deleteOnboarding(v.onboardingId),
          ).map(() => operatorExternalId),
        )
        .andThen((operatorExternalId) =>
          new ResultAsync(
            deps.sessionRepository.revokeByOperatorExternalId(
              operatorExternalId,
            ),
          ).map(() => operatorExternalId),
        )
        .andThen(
          (operatorExternalId) =>
            new ResultAsync(
              deps.operatorRepository.getByExternalId(operatorExternalId),
            ),
        )
        .andThen((operator) =>
          operator
            ? new ResultAsync(
                deps.operatorRepository.revokeById({
                  operatorId: operator.id,
                  revocationMessage: v.revocationMessage,
                  suspensionMessage: CASCADE_SUSPENSION_MESSAGE,
                }),
              ).andThen(() =>
                // best-effort: a failed refresh must not undo a completed revocation.
                new ResultAsync(
                  deps.materializedViewRepository.refreshAll(),
                ).orElse(() => okAsync(undefined)),
              )
            : okAsync(undefined),
        )
        .map(() => undefined),
    );
