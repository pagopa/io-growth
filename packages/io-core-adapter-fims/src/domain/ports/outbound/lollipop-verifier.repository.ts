import type { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

import type { FimsUser, LollipopHeaders } from "../../entities.js";

export interface LollipopVerifier {
  /**
   * Full lollipop verification for a FIMS callback request.
   * Verifies SAML assertion signatures, thumbprint, HTTP message signatures, and state.
   */
  readonly verify: (
    user: FimsUser,
    headers: LollipopHeaders,
    state: string,
    fimsRedirectUrl: string,
    idpKeysBaseUrl: string,
  ) => Promise<Result<true, UnauthorizedError>>;
}
