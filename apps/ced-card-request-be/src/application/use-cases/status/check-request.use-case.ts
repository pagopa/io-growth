import type {
  GestioneDomandaCedRepository,
  TipoEsitoCheck,
} from "@pagopa/io-core-adapter-inps-ced";
import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z } from "zod";

import type { ApplicationState } from "../../../domain/entities/application-state.js";
import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";
import type {
  ApplicantData,
  ApplicantDataResolver,
} from "../../ports/applicant-data-resolver.js";

import { mapEsitoCheckToState } from "../../../domain/entities/application-state.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

export const CheckRequestInputSchema = z.object({
  familyName: z.string().min(1),
  fiscalCode: z.string().length(16),
  givenName: z.string().min(1),
});

export type CheckRequestInput = z.infer<typeof CheckRequestInputSchema>;

export interface CheckRequestOutput {
  /** Applicant data prefilled from FIMS identity and fiscal code. */
  readonly applicantData: ApplicantData;
  /** Raw INPS CheckDomanda outcome used to derive the application state. */
  readonly esitoCheck: TipoEsitoCheck;
  /** INPS idLavorazione bound to the application, when one exists. */
  readonly idLavorazione?: null | string;
  /** INPS-assigned document number, present when state is ACQUIRED. */
  readonly numDomus?: string;
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
 *
 * When the state is ACQUIRED, `numDomus` is read from the local support record
 * (persisted during confirm). A Cosmos read failure surfaces as a 503.
 */
export const makeCheckRequestUseCase =
  (
    gestioneDomandaCedRepository: GestioneDomandaCedRepository,
    supportRecordRepository: SupportRecordRepository,
    applicantDataResolver: ApplicantDataResolver,
  ): CheckRequestUseCase =>
  async (input) => {
    const validated = await validateUseCaseInput(
      CheckRequestInputSchema,
      input,
    );
    if (validated.isErr()) return err(validated.error);

    const checkResult = await gestioneDomandaCedRepository.checkDomanda({
      codiceFiscale: validated.value.fiscalCode,
    });
    if (checkResult.isErr()) return err(checkResult.error);
    const response = checkResult.value;

    if (response.esitoCheck === undefined) {
      return err(new GenericError("INPS CheckDomanda returned no esitoCheck"));
    }

    const state = mapEsitoCheckToState(response.esitoCheck);
    if (!state) {
      return err(
        new GenericError(
          `INPS CheckDomanda returned an unmapped esitoCheck: ${String(response.esitoCheck)}`,
        ),
      );
    }

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
      applicantData: applicantDataResolver.resolve(validated.value),
      esitoCheck: response.esitoCheck,
      idLavorazione: response.idLavorazione,
      state,
      ...(numDomus !== undefined ? { numDomus } : {}),
    };

    return ok(output);
  };
