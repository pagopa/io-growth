import type {
  GestioneDomandaCedRepository,
  TipoEsitoCheck,
} from "@pagopa/io-core-adapter-inps-ced";
import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import type { ApplicationState } from "../../../domain/entities/application-state.js";
import type {
  PendingStep,
  SupportRecord,
  SupportRecordSteps,
} from "../../../domain/entities/support-record.js";
import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";

import { mapEsitoCheckToState } from "../../../domain/entities/application-state.js";
import { createEmptySupportRecord } from "../../../domain/entities/support-record.js";
import { validateUseCaseInput } from "../utils/validate-use-case-input.js";

export const CheckRequestInputSchema = z.object({
  fiscalCode: z.string().length(16),
});

export type CheckRequestInput = z.infer<typeof CheckRequestInputSchema>;

export interface CheckRequestOutput {
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
 * The INPS milestone is reconciled into the local CosmosDB support record.
 * This repairs stale or missing records after timeouts and process restarts,
 * while preserving INPS as the authoritative source of truth.
 */
const pendingStepKey = (pendingStep: PendingStep): keyof SupportRecordSteps => {
  switch (pendingStep) {
    case "CONFIRM":
      return "confirm";
    case "DRAFT":
      return "draft";
    case "PHOTO":
      return "photo";
  }
};

const ACTIVE_MILESTONE_RANK: Partial<Record<TipoEsitoCheck, number>> = {
  20: 1,
  30: 2,
  40: 3,
};

const REQUIRED_MILESTONE_RANK_BY_STEP: Record<PendingStep, number> = {
  CONFIRM: 3,
  DRAFT: 1,
  PHOTO: 2,
};

const hasInpsReachedOrPassedStep = (
  pendingStep: PendingStep,
  esitoCheck: TipoEsitoCheck,
): boolean =>
  (ACTIVE_MILESTONE_RANK[esitoCheck] ?? 0) >=
  REQUIRED_MILESTONE_RANK_BY_STEP[pendingStep];

const reconcileActiveRecord = (
  existing: SupportRecord,
  esitoCheck: TipoEsitoCheck,
  idLavorazione: string,
  state: SupportRecord["state"],
  now: string,
): SupportRecord => {
  const pendingStep = existing.pendingStep;
  const steps = { ...existing.steps };

  // A reached milestone completes the pending step. Otherwise the step stays
  // PENDING but pendingStep is released, allowing a safe retry with the same key.
  if (pendingStep && hasInpsReachedOrPassedStep(pendingStep, esitoCheck)) {
    const stepKey = pendingStepKey(pendingStep);
    const step = steps[stepKey];
    if (step) {
      steps[stepKey] = {
        ...step,
        completedAt: step.completedAt ?? now,
        lastErrorCode: null,
        status: "COMPLETED",
      };
    }
  }

  return {
    ...existing,
    idLavorazione,
    lastReconciliation: { at: now, esitoCheck },
    numDomus:
      state === "ACQUIRED" && existing.idLavorazione === idLavorazione
        ? existing.numDomus
        : null,
    pendingStep: null,
    state,
    steps,
    updatedAt: now,
  };
};

const reconcileNoActiveDraft = (
  existing: SupportRecord,
  esitoCheck: TipoEsitoCheck,
  previousIdLavorazione: null | string,
  now: string,
): SupportRecord => ({
  ...existing,
  idLavorazione: null,
  lastReconciliation: { at: now, esitoCheck },
  numDomus: null,
  pendingStep: null,
  previousIdLavorazione,
  state: "READY_FOR_NEW_DRAFT",
  steps: { confirm: null, draft: null, photo: null },
  updatedAt: now,
});

interface CheckDomandaResult {
  readonly esitoCheck: TipoEsitoCheck;
  readonly idLavorazione?: null | string;
}

const buildReconciledRecord = (
  codiceFiscale: string,
  existing: SupportRecord | undefined,
  response: CheckDomandaResult,
  state: SupportRecord["state"],
  now: string,
): Result<SupportRecord | undefined, GenericError> => {
  if (response.esitoCheck === 10 && !existing) {
    return ok(undefined);
  }

  // 10 and 50 are outside the active 20 -> 30 -> 40 flow: 10 means no application,
  // while 50 retains only the closed application's identifier for history.
  if (response.esitoCheck === 10 || response.esitoCheck === 50) {
    const base = existing ?? createEmptySupportRecord(codiceFiscale, now);
    const previousIdLavorazione =
      response.esitoCheck === 50
        ? (existing?.idLavorazione ??
          response.idLavorazione ??
          existing?.previousIdLavorazione ??
          null)
        : (existing?.previousIdLavorazione ?? null);

    return ok(
      reconcileNoActiveDraft(
        base,
        response.esitoCheck,
        previousIdLavorazione,
        now,
      ),
    );
  }

  if (!response.idLavorazione) {
    return err(
      new GenericError(
        "INPS CheckDomanda returned no idLavorazione for an active application",
      ),
    );
  }

  const base = existing ?? createEmptySupportRecord(codiceFiscale, now);
  return ok(
    reconcileActiveRecord(
      base,
      response.esitoCheck,
      response.idLavorazione,
      state,
      now,
    ),
  );
};

export const makeCheckRequestUseCase =
  (
    gestioneDomandaCedRepository: GestioneDomandaCedRepository,
    supportRecordRepository: SupportRecordRepository,
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

    const recordResult = await supportRecordRepository.getByCodiceFiscale(
      validated.value.fiscalCode,
    );
    if (recordResult.isErr()) return err(recordResult.error);

    const now = new Date().toISOString();
    const reconciliationResult = buildReconciledRecord(
      validated.value.fiscalCode,
      recordResult.value,
      {
        esitoCheck: response.esitoCheck,
        idLavorazione: response.idLavorazione,
      },
      state,
      now,
    );
    if (reconciliationResult.isErr()) return err(reconciliationResult.error);
    let reconciled = reconciliationResult.value;

    if (reconciled) {
      const saveResult = await supportRecordRepository.save(reconciled);
      if (saveResult.isErr()) return err(saveResult.error);
      reconciled = saveResult.value;
    }

    const output: CheckRequestOutput = {
      idLavorazione: response.idLavorazione,
      state,
      ...(state === "ACQUIRED" && reconciled?.numDomus
        ? { numDomus: reconciled.numDomus }
        : {}),
    };

    return ok(output);
  };
