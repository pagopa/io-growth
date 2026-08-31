import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { err, ok } from "neverthrow";
import { z } from "zod";

import type { ApplicationState } from "../../../domain/entities/application-state.js";
import type { CardApplicationRepository } from "../../../domain/ports/outbound/card-application.repository.js";
import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";

import { FiscalCodeSchema } from "../../../domain/entities/card-application.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

export const CheckRequestInputSchema = z.object({
  fiscalCode: FiscalCodeSchema,
});

export type CheckRequestInput = z.infer<typeof CheckRequestInputSchema>;

export interface CheckRequestOutput {
  /** Upstream idLavorazione bound to the application, when one exists. */
  readonly idLavorazione?: null | string;
  /** Upstream-assigned document number, present when state is ACQUIRED. */
  readonly numDomus?: string;
  /** Current stable application state, mapped from the upstream milestone. */
  readonly state: ApplicationState;
}

export type CheckRequestUseCase = UseCase<
  CheckRequestInput,
  CheckRequestOutput,
  BaseError
>;

/**
 * Check request flow.
 *
 * Asks the {@link CardApplicationRepository} port for the citizen's current
 * application milestone; the outbound adapter owns the translation of the
 * upstream response into the `ApplicationState` used by the frontend to direct
 * the user flow. The fiscal code identity is threaded to INPS via the ModI
 * signed-fetch identity headers (populated from the session in the composition
 * root).
 *
 * When the state is ACQUIRED, `numDomus` is read from the local support record
 * (persisted during confirm). A Cosmos read failure surfaces as a 503.
 */
export const makeCheckRequestUseCase =
  (
    cardApplicationRepository: CardApplicationRepository,
    supportRecordRepository: SupportRecordRepository,
  ): CheckRequestUseCase =>
  async (input) => {
    const validated = await validateUseCaseInput(
      CheckRequestInputSchema,
      input,
    );
    if (validated.isErr()) return err(validated.error);

    const checkResult = await cardApplicationRepository.checkApplicationState(
      validated.value.fiscalCode,
    );
    if (checkResult.isErr()) return err(checkResult.error);
    const { idLavorazione, state } = checkResult.value;

    let numDomus: string | undefined;
    if (state === "ACQUIRED") {
      const recordResult = await supportRecordRepository.getByCodiceFiscale(
        validated.value.fiscalCode,
      );
      if (recordResult.isErr()) return err(recordResult.error);
      if (recordResult.value?.numDomus) {
        numDomus = recordResult.value.numDomus;
      }
    }

    const output: CheckRequestOutput = {
      idLavorazione,
      state,
      ...(numDomus !== undefined ? { numDomus } : {}),
    };

    return ok(output);
  };
