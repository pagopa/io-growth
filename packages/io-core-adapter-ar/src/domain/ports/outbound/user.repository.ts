import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { UserResponse } from "../../../generated/model/userResponse.js";

export interface UserRepository {
  getUserById: (id: string) => Promise<Result<UserResponse, GenericError>>;
}
