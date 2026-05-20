import type {
  GenericError,
  UnauthorizedError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { FimsUser } from "../../entities.js";

export interface OidcClient {
  /**
   * Exchange an authorisation code for FIMS user data.
   * Internally fetches an access token then calls the userinfo endpoint.
   */
  readonly exchangeCode: (
    code: string,
    state: string,
    nonce: string,
    iss: string,
  ) => Promise<Result<FimsUser, UnauthorizedError>>;
  /**
   * Build the OIDC authorisation URL to redirect the user-agent to the FIMS IdP.
   */
  readonly getAuthorizationUrl: (
    state: string,
    nonce: string,
  ) => Promise<Result<string, GenericError>>;
}
