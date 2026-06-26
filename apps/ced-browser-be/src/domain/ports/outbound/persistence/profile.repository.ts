import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { OperatorProfileDetail } from "../../../entities/profile.js";
import type { Language } from "./place.repository.js";

export interface GetOperatorProfileInput {
  language: Language;
  profileId: string;
}

export interface ProfileRepository {
  readonly getById: (
    input: GetOperatorProfileInput,
  ) => Promise<Result<OperatorProfileDetail | undefined, GenericError>>;
}
