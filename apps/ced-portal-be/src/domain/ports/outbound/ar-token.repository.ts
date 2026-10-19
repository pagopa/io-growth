import type {
  ServiceUnavailableError,
  UnauthorizedError,
} from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface ArTokenRepository {
  /** Verifies issuer, expiry and signature, and returns the verified claims. */
  readonly verifyToken: (
    token: string,
  ) => Promise<
    Result<Record<string, unknown>, ServiceUnavailableError | UnauthorizedError>
  >;
}
