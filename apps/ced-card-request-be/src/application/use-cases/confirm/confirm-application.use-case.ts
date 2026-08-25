import type {
  ConfermaDomandaRequest,
  GestioneDomandaCedRepository,
} from "@pagopa/io-core-adapter-inps-ced";
import type { UseCase } from "@pagopa/io-core-domain";
import type { ServiceUnavailableError } from "@pagopa/io-core-domain/errors";

import { GenericError, ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z } from "zod";

import type { ApplicationState } from "../../../domain/entities/application-state.js";
import type {
  StepInfo,
  SupportRecord,
} from "../../../domain/entities/support-record.js";
import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";

import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

export const ConfirmApplicationInputSchema = z.object({
  allegato: z.string().nullish(),
  autodichiarazioneSentenza: z.boolean().nullish(),
  clientRequestId: z.uuid(),
  codiceFiscale: z.string().length(16),
  dataSentenza: z.string().nullish(),
  descrizioneComuneTribunale: z.string().nullish(),
  dichiarazioneConformitaVerbale: z.boolean().nullish(),
  dirittoAccompagnatore: z.boolean().nullish(),
  idLavorazione: z.string().min(1).max(20),
  nomeFile: z.string().nullish(),
  siglaProvinciaTribunale: z.string().nullish(),
  tipologiaUlterioreDocumentazione: z
    .union([z.literal(1), z.literal(2), z.literal(3)])
    .nullish(),
});

export type ConfirmApplicationInput = z.infer<
  typeof ConfirmApplicationInputSchema
>;

export interface ConfirmApplicationOutput {
  readonly numDomus: null | string;
  readonly state: ApplicationState;
}

export type ConfirmApplicationUseCase = UseCase<
  ConfirmApplicationInput,
  ConfirmApplicationOutput,
  GenericError | ServiceUnavailableError | ValidationError
>;

const toInpsRequest = (
  input: ConfirmApplicationInput,
): ConfermaDomandaRequest => ({
  codiceFiscale: input.codiceFiscale,
  idLavorazione: input.idLavorazione,
  ulterioreDocumentazione:
    input.tipologiaUlterioreDocumentazione == null
      ? undefined
      : {
          allegato: input.allegato ?? null,
          autodichiarazioneSentenza: input.autodichiarazioneSentenza ?? null,
          dataSentenza: input.dataSentenza ?? null,
          descrizioneComuneTribunale: input.descrizioneComuneTribunale ?? null,
          dichiarazioneConformitaVerbale:
            input.dichiarazioneConformitaVerbale ?? null,
          dirittoAccompagnatore: input.dirittoAccompagnatore ?? null,
          nomeFile: input.nomeFile ?? null,
          siglaProvinciaTribunale: input.siglaProvinciaTribunale ?? null,
          tipologiaUlterioreDocumentazione:
            input.tipologiaUlterioreDocumentazione,
        },
});

/**
 * A retry (same client key, PENDING/FAILED) reuses the INPS key. A new
 * intent (different client key) rotates it. Unlike draft/photo, confirm is
 * terminal — there is no downstream step to cascade-reset.
 */
const resolveConfirmIntent = (
  existingConfirmStep: null | StepInfo,
  clientRequestId: string,
): { attempts: number; inpsIdempotencyKey: string } => {
  const isRetry =
    existingConfirmStep !== null &&
    existingConfirmStep.clientRequestId === clientRequestId;

  return {
    attempts:
      isRetry && existingConfirmStep ? existingConfirmStep.attempts + 1 : 1,
    inpsIdempotencyKey:
      isRetry && existingConfirmStep
        ? existingConfirmStep.inpsIdempotencyKey
        : crypto.randomUUID(),
  };
};

const buildIntentRecord = (
  existing: SupportRecord,
  pendingConfirmStep: StepInfo,
  now: string,
): SupportRecord => ({
  ...existing,
  pendingStep: "CONFIRM",
  steps: {
    ...existing.steps,
    confirm: pendingConfirmStep,
  },
  updatedAt: now,
});

const buildFailedOutcome = (
  persistedIntent: SupportRecord,
  pendingConfirmStep: StepInfo,
  errorMessage: string,
): SupportRecord => ({
  ...persistedIntent,
  pendingStep: null,
  steps: {
    ...persistedIntent.steps,
    confirm: {
      ...pendingConfirmStep,
      lastErrorCode: errorMessage,
      status: "FAILED",
    },
  },
  updatedAt: new Date().toISOString(),
});

const buildCompletedOutcome = (
  persistedIntent: SupportRecord,
  pendingConfirmStep: StepInfo,
  numDomus: null | string,
): SupportRecord => ({
  ...persistedIntent,
  numDomus,
  pendingStep: null,
  state: "ACQUIRED",
  steps: {
    ...persistedIntent.steps,
    confirm: {
      ...pendingConfirmStep,
      completedAt: new Date().toISOString(),
      status: "COMPLETED",
    },
  },
  updatedAt: new Date().toISOString(),
});

export const makeConfirmApplicationUseCase =
  (
    supportRecordRepository: SupportRecordRepository,
    gestioneDomandaCedRepository: GestioneDomandaCedRepository,
  ): ConfirmApplicationUseCase =>
  async (input) => {
    const validated = await validateUseCaseInput(
      ConfirmApplicationInputSchema,
      input,
    );
    if (validated.isErr()) return err(validated.error);
    const { clientRequestId, codiceFiscale, idLavorazione } = validated.value;

    const existingResult =
      await supportRecordRepository.getByCodiceFiscale(codiceFiscale);
    if (existingResult.isErr()) return err(existingResult.error);
    const existing = existingResult.value;

    // Ownership guard: confirmation can only be attached to the draft the
    // Citizen actually owns. INPS surfaces the same "state not coherent"
    // rule as 400/115; we mirror that here rather than a 404, since the
    // FE's remedy is identical in every case — go create/recreate the draft.
    if (!existing || existing.idLavorazione !== idLavorazione) {
      return err(
        new ValidationError(
          "idLavorazione does not match an active draft for this session",
        ),
      );
    }
    const existingConfirmStep = existing.steps.confirm;

    // Replay of a completed confirmation: return the cached outcome, no
    // INPS call.
    if (
      existingConfirmStep &&
      existingConfirmStep.clientRequestId === clientRequestId &&
      existingConfirmStep.status === "COMPLETED"
    ) {
      return ok({ numDomus: existing.numDomus ?? null, state: existing.state });
    }

    const now = new Date().toISOString();
    const { attempts, inpsIdempotencyKey } = resolveConfirmIntent(
      existingConfirmStep,
      clientRequestId,
    );
    const pendingConfirmStep: StepInfo = {
      attempts,
      clientRequestId,
      completedAt: null,
      inpsIdempotencyKey,
      lastErrorCode: null,
      status: "PENDING",
      submittedAt: now,
    };

    // Write 1: persist the intent before calling INPS. No cascade — confirm
    // is the terminal step.
    const write1Result = await supportRecordRepository.save(
      buildIntentRecord(existing, pendingConfirmStep, now),
    );
    if (write1Result.isErr()) return err(write1Result.error);
    const persistedIntent = write1Result.value;

    const inpsResult = await gestioneDomandaCedRepository.confermaDomanda(
      toInpsRequest(validated.value),
      { idempotencyKey: inpsIdempotencyKey },
    );

    if (inpsResult.isErr()) {
      const error = inpsResult.error;

      if (error instanceof ValidationError) {
        // INPS rejected the confirmation: mark the step FAILED (best-effort
        // — the 400 must reach the FE regardless of whether this write
        // succeeds).
        await supportRecordRepository.save(
          buildFailedOutcome(
            persistedIntent,
            pendingConfirmStep,
            error.message,
          ),
        );
        return err(error);
      }

      // INPS system error / timeout: leave the step PENDING so a retry
      // (same client key) safely reuses the same INPS Idempotency-Key.
      return err(new GenericError(`confermaDomanda failed: ${error.message}`));
    }

    const numDomus = inpsResult.value.numDomus ?? null;

    // INPS succeeded: Write 2 persists the outcome.
    const write2Result = await supportRecordRepository.save(
      buildCompletedOutcome(persistedIntent, pendingConfirmStep, numDomus),
    );

    if (write2Result.isErr()) {
      // Inconsistency point: INPS already acquired the application, but we
      // failed to persist the outcome locally. Reconciliation (GET /status)
      // will realign from `esitoCheck` on the next call.
      return err(
        new GenericError(
          `Failed to persist confirm outcome: ${write2Result.error.message}`,
        ),
      );
    }

    return ok({ numDomus, state: "ACQUIRED" });
  };
