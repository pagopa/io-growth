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
 * All secrets are stored as plain-text PEM values in Key Vault:
 *  - HTTPS client cert (PEM, may include chain)
 *  - HTTPS client private key (PKCS#8 PEM)
 *  - Signing cert (PEM chain, leaf first)
 *  - Signing private key (PKCS#8 PEM, RS256)
 *  - INPS HTTPS server CA chain (PEM)
 *  - INPS JWT signing CA chain (PEM)
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

    getInpsSigningCaChain: (): Promise<Result<string, BaseError>> =>
      getSecret(
        config.secretNames.inpsSigningCa,
        (msg) =>
          new GenericError(`Failed to load INPS signing CA chain: ${msg}`),
      ),

    getSigningCredentials: async (): Promise<
      Result<SigningCredentials, BaseError>
    > => {
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
