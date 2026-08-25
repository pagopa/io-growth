import type {
  GestioneDomandaCedRepository,
  NuovaDomandaInBozzaRequest,
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

const SUPPORT_RECORD_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export const CreateDraftInputSchema = z.object({
  capRec: z.string().min(1),
  civicoRec: z.string().nullish(),
  clientRequestId: z.uuid(),
  codiceFiscale: z.string().length(16),
  cognome: z.string().min(1),
  comuneNascita: z.string().nullish(),
  dataNascita: z.string().min(1),
  dataScadenzaPermessoSoggiorno: z.string().nullish(),
  datiAggiuntiviRec: z.string().nullish(),
  descrizioneComuneRec: z.string().min(1),
  idCittadinanza: z.union([z.literal(0), z.literal(2), z.literal(3)]),
  indirizzoRec: z.string().min(1),
  informativaPrivacy: z.boolean(),
  nome: z.string().min(1),
  pressoCognome: z.string().nullish(),
  pressoDenominazione: z.string().nullish(),
  pressoNome: z.string().nullish(),
  sesso: z.enum(["M", "F"]),
  siglaProvinciaNascita: z.string().nullish(),
  siglaProvinciaRec: z.string().min(1),
  statoNascita: z.string().min(1),
});

export type CreateDraftInput = z.infer<typeof CreateDraftInputSchema>;

export interface CreateDraftOutput {
  readonly idLavorazione?: string;
  readonly state: ApplicationState;
}

export type CreateDraftUseCase = UseCase<
  CreateDraftInput,
  CreateDraftOutput,
  GenericError | ServiceUnavailableError | ValidationError
>;

const emptySupportRecord = (
  codiceFiscale: string,
  now: string,
): SupportRecord => ({
  codiceFiscale,
  createdAt: now,
  idLavorazione: null,
  lastReconciliation: null,
  pendingStep: null,
  previousIdLavorazione: null,
  schemaVersion: 2,
  state: "READY_FOR_NEW_DRAFT",
  steps: { confirm: null, draft: null, photo: null },
  ttl: SUPPORT_RECORD_TTL_SECONDS,
  updatedAt: now,
});

const toInpsRequest = (
  codiceFiscale: string,
  input: CreateDraftInput,
): NuovaDomandaInBozzaRequest => ({
  anagrafica: {
    codiceFiscale,
    cognome: input.cognome,
    comuneNascita: input.comuneNascita ?? null,
    dataNascita: input.dataNascita,
    dataScadenzaPermessoSoggiorno: input.dataScadenzaPermessoSoggiorno ?? null,
    idCittadinanza: input.idCittadinanza,
    nome: input.nome,
    sesso: input.sesso,
    siglaProvinciaNascita: input.siglaProvinciaNascita ?? null,
    statoNascita: input.statoNascita,
  },
  informativaPrivacy: input.informativaPrivacy,
  recapito: {
    cap: input.capRec,
    civico: input.civicoRec ?? null,
    datiAggiuntivi: input.datiAggiuntiviRec ?? null,
    descrizioneComune: input.descrizioneComuneRec,
    indirizzo: input.indirizzoRec,
    pressoCognome: input.pressoCognome ?? null,
    pressoDenominazione: input.pressoDenominazione ?? null,
    pressoNome: input.pressoNome ?? null,
    siglaProvincia: input.siglaProvinciaRec,
  },
});

/**
 * A retry (same client key, PENDING/FAILED) reuses the INPS key. A new
 * intent (different/absent client key) rotates it — the caller is
 * responsible for cascading the reset of downstream steps + idLavorazione.
 */
const resolveDraftIntent = (
  existingDraftStep: null | StepInfo,
  clientRequestId: string,
): { attempts: number; inpsIdempotencyKey: string; isRetry: boolean } => {
  const isRetry =
    existingDraftStep !== null &&
    existingDraftStep.clientRequestId === clientRequestId;

  return {
    attempts: isRetry && existingDraftStep ? existingDraftStep.attempts + 1 : 1,
    inpsIdempotencyKey:
      isRetry && existingDraftStep
        ? existingDraftStep.inpsIdempotencyKey
        : crypto.randomUUID(),
    isRetry,
  };
};

const buildIntentRecord = (
  existing: SupportRecord,
  pendingDraftStep: StepInfo,
  isRetry: boolean,
  now: string,
): SupportRecord => ({
  ...existing,
  idLavorazione: isRetry ? existing.idLavorazione : null,
  pendingStep: "DRAFT",
  steps: {
    confirm: isRetry ? existing.steps.confirm : null,
    draft: pendingDraftStep,
    photo: isRetry ? existing.steps.photo : null,
  },
  updatedAt: now,
});

const buildFailedOutcome = (
  persistedIntent: SupportRecord,
  pendingDraftStep: StepInfo,
  errorMessage: string,
): SupportRecord => ({
  ...persistedIntent,
  pendingStep: null,
  steps: {
    ...persistedIntent.steps,
    draft: {
      ...pendingDraftStep,
      lastErrorCode: errorMessage,
      status: "FAILED",
    },
  },
  updatedAt: new Date().toISOString(),
});

const buildCompletedOutcome = (
  persistedIntent: SupportRecord,
  pendingDraftStep: StepInfo,
  idLavorazione: null | string,
): SupportRecord => ({
  ...persistedIntent,
  idLavorazione,
  pendingStep: null,
  state: "READY_FOR_PHOTO_UPLOAD",
  steps: {
    ...persistedIntent.steps,
    draft: {
      ...pendingDraftStep,
      completedAt: new Date().toISOString(),
      status: "COMPLETED",
    },
  },
  updatedAt: new Date().toISOString(),
});

export const makeCreateDraftUseCase =
  (
    supportRecordRepository: SupportRecordRepository,
    gestioneDomandaCedRepository: GestioneDomandaCedRepository,
  ): CreateDraftUseCase =>
  async (input) => {
    const validated = await validateUseCaseInput(CreateDraftInputSchema, input);
    if (validated.isErr()) return err(validated.error);
    const { clientRequestId, codiceFiscale } = validated.value;

    const existingResult =
      await supportRecordRepository.getByCodiceFiscale(codiceFiscale);
    if (existingResult.isErr()) return err(existingResult.error);

    const now = new Date().toISOString();
    const existing =
      existingResult.value ?? emptySupportRecord(codiceFiscale, now);
    const existingDraftStep = existing.steps.draft;

    // Replay of a completed draft: return the cached outcome, no INPS call.
    if (
      existingDraftStep &&
      existingDraftStep.clientRequestId === clientRequestId &&
      existingDraftStep.status === "COMPLETED"
    ) {
      return ok({
        idLavorazione: existing.idLavorazione ?? undefined,
        state: existing.state,
      });
    }

    const { attempts, inpsIdempotencyKey, isRetry } = resolveDraftIntent(
      existingDraftStep,
      clientRequestId,
    );
    const pendingDraftStep: StepInfo = {
      attempts,
      clientRequestId,
      completedAt: null,
      inpsIdempotencyKey,
      lastErrorCode: null,
      status: "PENDING",
      submittedAt: now,
    };

    // Persist the pending intent before calling INPS.
    const saveIntentResult = await supportRecordRepository.save(
      buildIntentRecord(existing, pendingDraftStep, isRetry, now),
    );
    if (saveIntentResult.isErr()) return err(saveIntentResult.error);
    const persistedIntent = saveIntentResult.value;

    const inpsResult = await gestioneDomandaCedRepository.nuovaDomandaInBozza(
      toInpsRequest(codiceFiscale, validated.value),
      { idempotencyKey: inpsIdempotencyKey },
    );

    if (inpsResult.isErr()) {
      const error = inpsResult.error;
      if (error instanceof ValidationError) {
        // INPS rejected the data: mark the step FAILED (best-effort — the
        // 400 must reach the FE regardless of whether this write succeeds).
        await supportRecordRepository.save(
          buildFailedOutcome(persistedIntent, pendingDraftStep, error.message),
        );
        return err(error);
      }

      // INPS system error / timeout: leave the step PENDING so a retry
      // (same client key) safely reuses the same INPS Idempotency-Key.
      return err(
        new GenericError(`nuovaDomandaInBozza failed: ${error.message}`),
      );
    }

    // INPS succeeded: persist the completed outcome.
    const idLavorazione = inpsResult.value.idLavorazione ?? null;
    const saveOutcomeResult = await supportRecordRepository.save(
      buildCompletedOutcome(persistedIntent, pendingDraftStep, idLavorazione),
    );

    if (saveOutcomeResult.isErr()) {
      // Inconsistency point: INPS already created the draft, but we failed
      // to persist the outcome locally. Reconciliation (GET /status) will
      // realign from `esitoCheck` on the next call.
      return err(
        new GenericError(
          `Failed to persist draft outcome: ${saveOutcomeResult.error.message}`,
        ),
      );
    }

    return ok({
      idLavorazione: idLavorazione ?? undefined,
      state: "READY_FOR_PHOTO_UPLOAD",
    });
  };
