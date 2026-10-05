import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Language } from "../../../entities/language.js";
import type { OperatorProfileDetail } from "../../../entities/profile.js";

export interface GetOperatorProfileInput {
  language: Language;
  profileId: string;
}

export interface ProfileRepository {
  readonly getById: (
    input: GetOperatorProfileInput,
  ) => Promise<Result<OperatorProfileDetail | undefined, GenericError>>;
}
