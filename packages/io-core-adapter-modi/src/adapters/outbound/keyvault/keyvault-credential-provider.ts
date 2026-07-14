import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { CryptoKey } from "jose";
import type { Result } from "neverthrow";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { importPKCS8 } from "jose";
import { err, ok } from "neverthrow";

import type { ModiConfig } from "../../../config.js";
import type {
  HttpsClientCredentials,
  ModiCredentialProvider,
  SigningCredentials,
} from "../../../domain/ports/outbound/credential-provider.port.js";

const pemCertsToDerBase64 = (pemChain: string): string[] =>
  pemChain
    .split(/(?=-----BEGIN CERTIFICATE-----)/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block
        .replace(/-----BEGIN CERTIFICATE-----/, "")
        .replace(/-----END CERTIFICATE-----/, "")
        .replace(/\s+/g, ""),
    );

/**
 * Production credential provider backed by Azure Key Vault.
 *
 * All secrets are stored as plain-text PEM values in Key Vault.
 * Methods that are not applicable to the configured profile
 * (`getHttpsClientCredentials`, `getInpsHttpsCaChain`,
 * `getInpsSigningCaChain` for P1/P2) return a `GenericError` immediately —
 * they are never called by `createSignedFetch` for those profiles.
 *
 * | Method                       | P1 | P2 | P3 |
 * |------------------------------|----|----|-----|
 * | `getSigningCredentials`      | ❌ | ✅ | ✅ |
 * | `getInpsSigningCaChain`      | ❌ | ❌ | ✅ |
 * | `getHttpsClientCredentials`  | ✅ | ✅ | ✅ |
 * | `getInpsHttpsCaChain`        | ✅ | ✅ | ✅ |
 */
export const createKeyvaultCredentialProvider = async (
  config: ModiConfig,
): Promise<ModiCredentialProvider> => {
  // Lazily imported so the package compiles without the azure SDK in tests.
  const { SecretClient } = await import("@azure/keyvault-secrets");
  const { DefaultAzureCredential } = await import("@azure/identity");

  const client = new SecretClient(
    config.keyVaultUrl,
    new DefaultAzureCredential(),
  );

  const fetchSecret = async (name: string): Promise<string> => {
    const secret = await client.getSecret(name);
    if (!secret.value) {
      throw new Error(`Key Vault secret '${name}' has no value`);
    }
    return secret.value;
  };

  const getSecret = async <E extends BaseError>(
    name: string,
    mapError: (msg: string) => E,
  ): Promise<Result<string, E>> => {
    try {
      return ok(await fetchSecret(name));
    } catch (error) {
      return err(mapError(String(error)));
    }
  };

  /** Returns an error explaining the method is unavailable for the profile. */
  const profileGuard = (method: string): Promise<Result<never, GenericError>> =>
    Promise.resolve(
      err(
        new GenericError(
          `'${method}' requires ModI profile P3 but the configured profile is ${config.profile}`,
        ),
      ),
    );

  return {
    getHttpsClientCredentials: async (): Promise<
      Result<HttpsClientCredentials, BaseError>
    > => {
      try {
        const [cert, key] = await Promise.all([
          fetchSecret(config.secretNames.httpsClientCert),
          fetchSecret(config.secretNames.httpsClientKey),
        ]);
        return ok({ cert, key });
      } catch (error) {
        return err(
          new GenericError(
            `Failed to load HTTPS client credentials: ${String(error)}`,
          ),
        );
      }
    },

    getInpsHttpsCaChain: (): Promise<Result<string, BaseError>> =>
      getSecret(
        config.secretNames.inpsHttpsCa,
        (msg) => new GenericError(`Failed to load INPS HTTPS CA chain: ${msg}`),
      ),

    getInpsSigningCaChain: (): Promise<Result<string, BaseError>> => {
      if (config.profile !== "P3") {
        return profileGuard("getInpsSigningCaChain");
      }
      return getSecret(
        config.secretNames.inpsSigningCa,
        (msg) =>
          new GenericError(`Failed to load INPS signing CA chain: ${msg}`),
      );
    },

    getSigningCredentials: async (): Promise<
      Result<SigningCredentials, BaseError>
    > => {
      if (config.profile === "P1") {
        return Promise.resolve(
          err(
            new GenericError(
              "'getSigningCredentials' is not used by ModI profile P1 (mTLS only)",
            ),
          ),
        );
      }
      try {
        const [certPem, keyPem] = await Promise.all([
          fetchSecret(config.secretNames.signingCert),
          fetchSecret(config.secretNames.signingKey),
        ]);
        const privateKey: CryptoKey = (await importPKCS8(
          keyPem,
          "RS256",
        )) as CryptoKey;
        const x5c = pemCertsToDerBase64(certPem);
        return ok({ privateKey, x5c });
      } catch (error) {
        return err(
          new GenericError(
            `Failed to load signing credentials: ${String(error)}`,
          ),
        );
      }
    },
  };
};
