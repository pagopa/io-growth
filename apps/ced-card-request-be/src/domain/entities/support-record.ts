import type { MilestoneState } from "./application-state.js";

/** The step whose write is currently in flight, if any. */
export const PENDING_STEPS = ["DRAFT", "PHOTO", "CONFIRM"] as const;

export type PendingStep = (typeof PENDING_STEPS)[number];

export const STEP_STATUSES = ["PENDING", "COMPLETED", "FAILED"] as const;

export interface ReconciliationSnapshot {
  readonly at: string;
  readonly esitoCheck: number;
}

/** Per-step idempotency bookkeeping (draft, photo, or confirm). */
export interface StepInfo {
  readonly attempts: number;
  /** The Idempotency-Key the client sent for this step (the user's intent). */
  readonly clientRequestId: string;
  readonly completedAt: null | string;
  /** The Idempotency-Key sent to INPS for this step. */
  readonly inpsIdempotencyKey: string;
  readonly lastErrorCode: null | string;
  readonly status: StepStatus;
  readonly submittedAt: string;
}

export type StepStatus = (typeof STEP_STATUSES)[number];

/**
 * The single CosmosDB document per Citizen (keyed by Codice Fiscale). It is a
 * support record only: INPS remains the source of truth for the application
 * state; this record exists to drive idempotency and reconciliation.
 */
export interface SupportRecord {
  /** Optimistic concurrency token; absent for a record not yet persisted. */
  readonly _etag?: string;
  readonly codiceFiscale: string;
  readonly createdAt: string;
  readonly idLavorazione: null | string;
  readonly lastReconciliation: null | ReconciliationSnapshot;
  /** INPS-assigned document number, populated once the application is ACQUIRED. */
  readonly numDomus?: null | string;
  readonly pendingStep: null | PendingStep;
  readonly previousIdLavorazione: null | string;
  readonly schemaVersion: 2;
  readonly state: MilestoneState;
  readonly steps: SupportRecordSteps;
  readonly ttl: number;
  readonly updatedAt: string;
}

export interface SupportRecordSteps {
  readonly confirm: null | StepInfo;
  readonly draft: null | StepInfo;
  readonly photo: null | StepInfo;
}
