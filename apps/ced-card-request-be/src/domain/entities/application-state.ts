import { TipoEsitoCheck } from "@pagopa/io-core-adapter-inps-ced";

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

export type ApplicationState = (typeof APPLICATION_STATES)[number];

/**
 * Maps the INPS `esitoCheck` milestone returned by CheckDomanda to the BFF
 * `ApplicationState` that directs the FE flow.
 *
 * | esitoCheck | Meaning                              | State                       |
 * |------------|--------------------------------------|-----------------------------|
 * | 10         | No draft on INPS                     | READY_FOR_NEW_DRAFT         |
 * | 20         | Draft, no photo                      | READY_FOR_PHOTO_UPLOAD      |
 * | 30         | Draft + photo                        | READY_FOR_DOCUMENTS_UPLOAD  |
 * | 40         | Acquired / processing                | ACQUIRED                    |
 * | 50         | Previous application closed (90/99)  | READY_FOR_NEW_DRAFT         |
 *
 * Returns `undefined` for any unmapped/unknown value.
 */
export const mapEsitoCheckToState = (
  esitoCheck: TipoEsitoCheck,
): ApplicationState | undefined => {
  switch (esitoCheck) {
    case TipoEsitoCheck.NUMBER_10:
    case TipoEsitoCheck.NUMBER_50:
      return "READY_FOR_NEW_DRAFT";
    case TipoEsitoCheck.NUMBER_20:
      return "READY_FOR_PHOTO_UPLOAD";
    case TipoEsitoCheck.NUMBER_30:
      return "READY_FOR_DOCUMENTS_UPLOAD";
    case TipoEsitoCheck.NUMBER_40:
      return "ACQUIRED";
    default:
      return undefined;
  }
};
