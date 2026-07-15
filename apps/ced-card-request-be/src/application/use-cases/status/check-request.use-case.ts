import type { GestioneDomandaCedRepository } from "@pagopa/io-core-adapter-inps-ced";
import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok, ResultAsync } from "neverthrow";
import { z } from "zod";

import type { ApplicationState } from "../../../domain/entities/application-state.js";

import { mapEsitoCheckToState } from "../../../domain/entities/application-state.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

export const CheckRequestInputSchema = z.object({
  fiscalCode: z.string().length(16),
});

export type CheckRequestInput = z.infer<typeof CheckRequestInputSchema>;

export interface CheckRequestOutput {
  /** INPS idLavorazione bound to the application, when one exists. */
  readonly idLavorazione?: null | string;
  /** Current stable application state, mapped from the INPS milestone. */
  readonly state: ApplicationState;
}

export type CheckRequestUseCase = UseCase<
  CheckRequestInput,
  CheckRequestOutput,
  BaseError
>;

/**
 * Check request flow (INPS CheckDomanda).
 *
 * Calls INPS `CheckDomanda` for the citizen's fiscal code, then maps the
 * returned `esitoCheck` milestone to the BFF `ApplicationState` used by the
 * frontend to direct the user flow. The fiscal code identity is threaded to
 * INPS via the ModI signed-fetch identity headers (populated from the session
 * in the composition root).
 */
export const makeCheckRequestUseCase =
  (
    gestioneDomandaCedRepository: GestioneDomandaCedRepository,
  ): CheckRequestUseCase =>
  async (input) =>
    validateUseCaseInput(CheckRequestInputSchema, input).andThen((validated) =>
      new ResultAsync(
        gestioneDomandaCedRepository.checkDomanda({
          codiceFiscale: validated.fiscalCode,
        }),
      ).andThen((response) => {
        if (response.esitoCheck === undefined) {
          return err(
            new GenericError("INPS CheckDomanda returned no esitoCheck"),
          );
        }

        const state = mapEsitoCheckToState(response.esitoCheck);
        if (!state) {
          return err(
            new GenericError(
              `INPS CheckDomanda returned an unmapped esitoCheck: ${String(
                response.esitoCheck,
              )}`,
            ),
          );
        }

        return ok({ idLavorazione: response.idLavorazione, state });
      }),
    );
