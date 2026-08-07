import type {
  FornisciFotoRequest,
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

export const UploadPhotoInputSchema = z.object({
  clientRequestId: z.uuid(),
  codiceFiscale: z.string().length(16),
  fotoCED: z.string().min(1),
  idLavorazione: z.string().min(1).max(20),
  informativaFoto: z.boolean(),
});

export type UploadPhotoInput = z.infer<typeof UploadPhotoInputSchema>;

export interface UploadPhotoOutput {
  readonly state: ApplicationState;
}

export type UploadPhotoUseCase = UseCase<
  UploadPhotoInput,
  UploadPhotoOutput,
  GenericError | ServiceUnavailableError | ValidationError
>;

const toInpsRequest = (input: UploadPhotoInput): FornisciFotoRequest => ({
  codiceFiscale: input.codiceFiscale,
  fotoCED: input.fotoCED,
  idLavorazione: input.idLavorazione,
  informativaFoto: input.informativaFoto,
});

/**
 * A retry (same client key, PENDING/FAILED) reuses the INPS key. A new
 * intent (different client key) rotates it — the caller is responsible for
 * cascading the reset of the downstream `confirm` step.
 */
const resolvePhotoIntent = (
  existingPhotoStep: null | StepInfo,
  clientRequestId: string,
): { attempts: number; inpsIdempotencyKey: string; isRetry: boolean } => {
  const isRetry =
    existingPhotoStep !== null &&
    existingPhotoStep.clientRequestId === clientRequestId;

  return {
    attempts: isRetry && existingPhotoStep ? existingPhotoStep.attempts + 1 : 1,
    inpsIdempotencyKey:
      isRetry && existingPhotoStep
        ? existingPhotoStep.inpsIdempotencyKey
        : crypto.randomUUID(),
    isRetry,
  };
};

const buildIntentRecord = (
  existing: SupportRecord,
  pendingPhotoStep: StepInfo,
  isRetry: boolean,
  now: string,
): SupportRecord => ({
  ...existing,
  pendingStep: "PHOTO",
  steps: {
    confirm: isRetry ? existing.steps.confirm : null,
    draft: existing.steps.draft,
    photo: pendingPhotoStep,
  },
  updatedAt: now,
});

const buildFailedOutcome = (
  persistedIntent: SupportRecord,
  pendingPhotoStep: StepInfo,
  errorMessage: string,
): SupportRecord => ({
  ...persistedIntent,
  pendingStep: null,
  steps: {
    ...persistedIntent.steps,
    photo: {
      ...pendingPhotoStep,
      lastErrorCode: errorMessage,
      status: "FAILED",
    },
  },
  updatedAt: new Date().toISOString(),
});

const buildCompletedOutcome = (
  persistedIntent: SupportRecord,
  pendingPhotoStep: StepInfo,
): SupportRecord => ({
  ...persistedIntent,
  lastReconciliation: null,
  pendingStep: null,
  state: "READY_FOR_DOCUMENTS_UPLOAD",
  steps: {
    ...persistedIntent.steps,
    photo: {
      ...pendingPhotoStep,
      completedAt: new Date().toISOString(),
      status: "COMPLETED",
    },
  },
  updatedAt: new Date().toISOString(),
});

export const makeUploadPhotoUseCase =
  (
    supportRecordRepository: SupportRecordRepository,
    gestioneDomandaCedRepository: GestioneDomandaCedRepository,
  ): UploadPhotoUseCase =>
  async (input) => {
    const validated = await validateUseCaseInput(UploadPhotoInputSchema, input);
    if (validated.isErr()) return err(validated.error);
    const { clientRequestId, codiceFiscale, idLavorazione } = validated.value;

    const existingResult =
      await supportRecordRepository.getByCodiceFiscale(codiceFiscale);
    if (existingResult.isErr()) return err(existingResult.error);
    const existing = existingResult.value;
    // Ownership guard: the photo can only be attached to the draft the
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
    const existingPhotoStep = existing.steps.photo;

    // Replay of a completed photo upload: return the cached outcome, no
    // INPS call.
    if (
      existingPhotoStep &&
      existingPhotoStep.clientRequestId === clientRequestId &&
      existingPhotoStep.status === "COMPLETED"
    ) {
      return ok({ state: existing.state });
    }

    const now = new Date().toISOString();
    const { attempts, inpsIdempotencyKey, isRetry } = resolvePhotoIntent(
      existingPhotoStep,
      clientRequestId,
    );
    const pendingPhotoStep: StepInfo = {
      attempts,
      clientRequestId,
      completedAt: null,
      inpsIdempotencyKey,
      lastErrorCode: null,
      status: "PENDING",
      submittedAt: now,
    };

    // Write 1: persist the intent before calling INPS.
    const write1Result = await supportRecordRepository.save(
      buildIntentRecord(existing, pendingPhotoStep, isRetry, now),
    );
    if (write1Result.isErr()) return err(write1Result.error);
    const persistedIntent = write1Result.value;

    const inpsResult = await gestioneDomandaCedRepository.fornisciFoto(
      toInpsRequest(validated.value),
      { idempotencyKey: inpsIdempotencyKey },
    );

    if (inpsResult.isErr()) {
      const error = inpsResult.error;

      if (error instanceof ValidationError) {
        // INPS rejected the photo: mark the step FAILED (best-effort — the
        // 400 must reach the FE regardless of whether this write succeeds).
        await supportRecordRepository.save(
          buildFailedOutcome(persistedIntent, pendingPhotoStep, error.message),
        );
        return err(error);
      }

      // INPS system error / timeout: leave the step PENDING so a retry
      // (same client key) safely reuses the same INPS Idempotency-Key.
      return err(new GenericError(`fornisciFoto failed: ${error.message}`));
    }

    // INPS succeeded: Write 2 persists the outcome.
    const write2Result = await supportRecordRepository.save(
      buildCompletedOutcome(persistedIntent, pendingPhotoStep),
    );

    if (write2Result.isErr()) {
      // Inconsistency point: INPS already accepted the photo, but we failed
      // to persist the outcome locally. Reconciliation (GET /status) will
      // realign from `esitoCheck` on the next call.
      return err(
        new GenericError(
          `Failed to persist photo outcome: ${write2Result.error.message}`,
        ),
      );
    }

    return ok({ state: "READY_FOR_DOCUMENTS_UPLOAD" });
  };
