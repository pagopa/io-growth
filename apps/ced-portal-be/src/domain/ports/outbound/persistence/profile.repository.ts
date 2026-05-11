import type {
  ConflictError,
  GenericError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { NewProfile, Profile } from "../../../entities/profile.js";

export interface ProfileRepository {
  readonly create: (
    input: NewProfile,
  ) => Promise<Result<void, ConflictError | GenericError>>;
  readonly getByOperatorId: (
    operatorId: string,
  ) => Promise<Result<Profile | undefined, GenericError>>;
}
