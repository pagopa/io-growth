import { z } from "zod";

import { MilestoneStateSchema } from "./application-state.js";

/** The step whose write is currently in flight, if any. */
export const PENDING_STEPS = ["DRAFT", "PHOTO", "CONFIRM"] as const;

export const PendingStepSchema = z.enum(PENDING_STEPS);

export type PendingStep = z.infer<typeof PendingStepSchema>;

export const STEP_STATUSES = ["PENDING", "COMPLETED", "FAILED"] as const;

export const StepStatusSchema = z.enum(STEP_STATUSES);

export type StepStatus = z.infer<typeof StepStatusSchema>;

export const ReconciliationSnapshotSchema = z.object({
  at: z.string(),
  esitoCheck: z.number(),
});

export type ReconciliationSnapshot = z.infer<
  typeof ReconciliationSnapshotSchema
>;

/** Per-step idempotency bookkeeping (draft, photo, or confirm). */
export const StepInfoSchema = z.object({
  attempts: z.number(),
  /** The Idempotency-Key the client sent for this step (the user's intent). */
  clientRequestId: z.string(),
  completedAt: z.string().nullable(),
  /** The Idempotency-Key sent to INPS for this step. */
  inpsIdempotencyKey: z.string(),
  lastErrorCode: z.string().nullable(),
  status: StepStatusSchema,
  submittedAt: z.string(),
});

export type StepInfo = z.infer<typeof StepInfoSchema>;

export const SupportRecordStepsSchema = z.object({
  confirm: StepInfoSchema.nullable(),
  draft: StepInfoSchema.nullable(),
  photo: StepInfoSchema.nullable(),
});

export type SupportRecordSteps = z.infer<typeof SupportRecordStepsSchema>;

/**
 * The single CosmosDB document per Citizen (keyed by Codice Fiscale). It is a
 * support record only: INPS remains the source of truth for the application
 * state; this record exists to drive idempotency and reconciliation.
 */
export const SupportRecordSchema = z.object({
  /** Optimistic concurrency token; absent for a record not yet persisted. */
  _etag: z.string().optional(),
  codiceFiscale: z.string(),
  createdAt: z.string(),
  idLavorazione: z.string().nullable(),
  lastReconciliation: ReconciliationSnapshotSchema.nullable(),
  /** INPS-assigned document number, populated once the application is ACQUIRED. */
  numDomus: z.string().nullable().optional(),
  pendingStep: PendingStepSchema.nullable(),
  previousIdLavorazione: z.string().nullable(),
  schemaVersion: z.literal(2),
  state: MilestoneStateSchema,
  steps: SupportRecordStepsSchema,
  ttl: z.number(),
  updatedAt: z.string(),
});

export type SupportRecord = z.infer<typeof SupportRecordSchema>;
