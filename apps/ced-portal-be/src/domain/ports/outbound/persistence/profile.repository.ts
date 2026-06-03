import type {
  ConflictError,
  GenericError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { Profile } from "../../../entities/profile.js";

export interface ProfileRepository {
  readonly create: (
    input: Profile,
  ) => Promise<Result<Profile, ConflictError | GenericError>>;
  readonly getByOperatorId: (
    operatorId: string,
  ) => Promise<Result<Profile | undefined, GenericError>>;
}
