import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type {
  ApplicationConfirmation,
  ApplicationConfirmed,
  ApplicationDraft,
  ApplicationDraftCreated,
  ApplicationPhoto,
  ApplicationStateCheck,
  RecoveredApplicationDraft,
} from "../../entities/card-application.js";

/**
 * Anti-corruption boundary towards the upstream application registry (INPS).
 *
 * Speaks only the BFF domain vocabulary: no upstream DTO, enum or error type
 * appears in this contract. The outbound adapter under `adapters/outbound/inps`
 * is the sole owner of the translation, so an upstream contract change is
 * absorbed by that adapter (and its mapper) without touching the application or
 * domain layers.
 */
export interface CardApplicationRepository {
  readonly checkApplicationState: (
    codiceFiscale: string,
  ) => Promise<Result<ApplicationStateCheck, BaseError>>;

  readonly confirmApplication: (
    confirmation: ApplicationConfirmation,
    opts: IdempotencyOptions,
  ) => Promise<Result<ApplicationConfirmed, BaseError>>;

  readonly createApplicationDraft: (
    draft: ApplicationDraft,
    opts: IdempotencyOptions,
  ) => Promise<Result<ApplicationDraftCreated, BaseError>>;

  readonly recoverApplicationDraft: (
    codiceFiscale: string,
    idLavorazione: string,
  ) => Promise<Result<RecoveredApplicationDraft, BaseError>>;

  readonly uploadPhoto: (
    photo: ApplicationPhoto,
    opts: IdempotencyOptions,
  ) => Promise<Result<void, BaseError>>;
}

export interface IdempotencyOptions {
  /** Key the BFF persists per step so a retry is replayed safely upstream. */
  readonly idempotencyKey: string;
}
