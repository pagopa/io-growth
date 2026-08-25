import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { CryptoKey } from "jose";
import type { Result } from "neverthrow";

export interface HttpsClientCredentials {
  readonly cert: string;
  readonly key: string;
}

/**
 * Port for loading ModI cryptographic credentials from a secret store.
 *
 * Implementations:
 *  - `createKeyvaultCredentialProvider` (production): Azure Key Vault via DefaultAzureCredential
 *  - In-memory / file providers (tests)
 */
export interface ModiCredentialProvider {
  readonly getHttpsClientCredentials: () => Promise<
    Result<HttpsClientCredentials, BaseError>
  >;
  readonly getInpsHttpsCaChain: () => Promise<Result<string, BaseError>>;
  readonly getInpsSigningCaChain: () => Promise<Result<string, BaseError>>;
  readonly getSigningCredentials: () => Promise<
    Result<SigningCredentials, BaseError>
  >;
}

export interface SigningCredentials {
  readonly privateKey: CryptoKey;
  readonly x5c: readonly string[];
}
