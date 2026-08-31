import { z } from "zod";

/**
 * Internal workflow state (managed by the BFF) that guides the FE display logic.
 * Mirrors the `ApplicationState` enum in the exposed OpenAPI contract.
 */
export const APPLICATION_STATES = [
  "READY_FOR_NEW_DRAFT",
  "DRAFT",
  "READY_FOR_PHOTO_UPLOAD",
  "UPLOADING_PHOTO",
  "READY_FOR_DOCUMENTS_UPLOAD",
  "UPLOADING_DOCUMENTS",
  "ACQUIRED",
] as const;

export const ApplicationStateSchema = z.enum(APPLICATION_STATES);

export type ApplicationState = z.infer<typeof ApplicationStateSchema>;

/**
 * The milestone states the upstream application registry can confirm through
 * {@link CardApplicationRepository.checkApplicationState}. A strict subset of
 * {@link ApplicationState}: a state check only ever produces one of these four
 * values, never the derived "uploading" states.
 */
export const MILESTONE_STATES = [
  "READY_FOR_NEW_DRAFT",
  "READY_FOR_PHOTO_UPLOAD",
  "READY_FOR_DOCUMENTS_UPLOAD",
  "ACQUIRED",
] as const satisfies readonly ApplicationState[];

export const MilestoneStateSchema = z.enum(MILESTONE_STATES);

export type MilestoneState = z.infer<typeof MilestoneStateSchema>;
