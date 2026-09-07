import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok, type Result } from "neverthrow";
import { z } from "zod";

import type { ApplicationState } from "../../../domain/entities/application-state.js";
import type { ApplicationCheckStatus } from "../../../domain/entities/card-application.js";
import type {
  PendingStep,
  SupportRecord,
  SupportRecordSteps,
} from "../../../domain/entities/support-record.js";
import type { CardApplicationRepository } from "../../../domain/ports/outbound/card-application.repository.js";
import type { SupportRecordRepository } from "../../../domain/ports/outbound/persistence/support-record.repository.js";

import { FiscalCodeSchema } from "../../../domain/entities/card-application.js";
import { createEmptySupportRecord } from "../../../domain/entities/support-record.js";
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

const ACTIVE_MILESTONE_RANK: Partial<Record<ApplicationCheckStatus, number>> = {
  ACQUIRED: 3,
  DRAFT: 1,
  PHOTO_ATTACHED: 2,
};

const REQUIRED_MILESTONE_RANK_BY_STEP: Record<PendingStep, number> = {
  CONFIRM: 3,
  DRAFT: 1,
  PHOTO: 2,
};

const hasInpsReachedOrPassedStep = (
  pendingStep: PendingStep,
  applicationStatus: ApplicationCheckStatus,
): boolean =>
  (ACTIVE_MILESTONE_RANK[applicationStatus] ?? 0) >=
  REQUIRED_MILESTONE_RANK_BY_STEP[pendingStep];

const reconcileActiveRecord = (
  existing: SupportRecord,
  applicationStatus: ApplicationCheckStatus,
  idLavorazione: string,
  state: SupportRecord["state"],
  now: string,
): SupportRecord => {
  const pendingStep = existing.pendingStep;
  const steps = { ...existing.steps };

  // A reached milestone completes the pending step. Otherwise the step stays
  // PENDING but pendingStep is released, allowing a safe retry with the same key.
  if (
    pendingStep &&
    hasInpsReachedOrPassedStep(pendingStep, applicationStatus)
  ) {
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
    lastReconciliation: { applicationStatus, at: now },
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
  applicationStatus: ApplicationCheckStatus,
  previousIdLavorazione: null | string,
  now: string,
): SupportRecord => ({
  ...existing,
  idLavorazione: null,
  lastReconciliation: { applicationStatus, at: now },
  numDomus: null,
  pendingStep: null,
  previousIdLavorazione,
  state: "READY_FOR_NEW_DRAFT",
  steps: { confirm: null, draft: null, photo: null },
  updatedAt: now,
});

interface ApplicationStateResult {
  readonly idLavorazione?: null | string;
  readonly status: ApplicationCheckStatus;
}

const buildReconciledRecord = (
  codiceFiscale: string,
  existing: SupportRecord | undefined,
  response: ApplicationStateResult,
  state: SupportRecord["state"],
  now: string,
): Result<SupportRecord | undefined, GenericError> => {
  if (response.status === "NO_APPLICATION" && !existing) {
    return ok(undefined);
  }

  if (response.status === "NO_APPLICATION" || response.status === "CLOSED") {
    const base = existing ?? createEmptySupportRecord(codiceFiscale, now);
    const previousIdLavorazione =
      response.status === "CLOSED"
        ? (existing?.idLavorazione ??
          response.idLavorazione ??
          existing?.previousIdLavorazione ??
          null)
        : (existing?.previousIdLavorazione ?? null);

    return ok(
      reconcileNoActiveDraft(base, response.status, previousIdLavorazione, now),
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
      response.status,
      response.idLavorazione,
      state,
      now,
    ),
  );
};

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
    const { idLavorazione, state, status } = checkResult.value;

    const recordResult = await supportRecordRepository.getByCodiceFiscale(
      validated.value.fiscalCode,
    );
    if (recordResult.isErr()) return err(recordResult.error);

    const now = new Date().toISOString();
    const reconciliationResult = buildReconciledRecord(
      validated.value.fiscalCode,
      recordResult.value,
      { idLavorazione, status },
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
      idLavorazione,
      state,
      ...(state === "ACQUIRED" && reconciled?.numDomus
        ? { numDomus: reconciled.numDomus }
        : {}),
    };

    return ok(output);
  };
