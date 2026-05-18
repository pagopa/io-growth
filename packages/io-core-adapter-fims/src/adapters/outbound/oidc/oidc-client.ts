import type { Result } from "neverthrow";

import { GenericError, UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { Issuer } from "openid-client";

import type { FimsUser, OidcConfig } from "../../../domain/entities.js";
import type { OidcClient } from "../../../domain/ports/outbound/oidc-client.repository.js";

// Singleton client cache keyed by issuerUrl+clientId to avoid repeated OIDC discovery within the same process
const clientCache = new Map<
  string,
  InstanceType<Awaited<ReturnType<typeof Issuer.discover>>["Client"]>
>();

const getClient = async (config: OidcConfig) => {
  const cacheKey = `${config.issuerUrl}::${config.clientId}`;
  if (!clientCache.has(cacheKey)) {
    const issuer = await Issuer.discover(config.issuerUrl);
    const client = new issuer.Client({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uris: [config.redirectUri],
      response_types: ["code"],
    });
    clientCache.set(cacheKey, client);
  }
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return clientCache.get(cacheKey)!;
};

export const createOidcClient = (config: OidcConfig): OidcClient => ({
  exchangeCode: async (
    code,
    state,
    nonce,
    iss,
  ): Promise<Result<FimsUser, UnauthorizedError>> => {
    try {
      const client = await getClient(config);
      const tokens = await client.callback(
        config.redirectUri,
        { code, iss, state },
        { nonce, state },
      );

      const accessToken = tokens.access_token;
      if (!accessToken) {
        return err(new UnauthorizedError("No access token received from FIMS"));
      }

      const userinfo = await client.userinfo(accessToken);
      const u = userinfo as Record<string, unknown>;

      // Validate required FIMS-specific fields — mirrors io-cdc OidcUser io-ts type.
      const assertionRefPattern = /^(sha256|sha384|sha512)-[A-Za-z0-9\-_=]+$/;
      const fiscalCodePattern = /^[A-Z0-9]{16}$/i;

      const isNonEmptyString = (v: unknown): v is string =>
        typeof v === "string" && v.length > 0;

      if (
        !isNonEmptyString(u["assertion"]) ||
        !isNonEmptyString(u["public_key"]) ||
        !isNonEmptyString(u["family_name"]) ||
        !isNonEmptyString(u["given_name"])
      ) {
        return err(
          new UnauthorizedError(
            "Invalid FIMS user data: missing required string fields",
          ),
        );
      }

      if (
        typeof u["assertion_ref"] !== "string" ||
        !assertionRefPattern.test(u["assertion_ref"])
      ) {
        return err(
          new UnauthorizedError(
            `Invalid FIMS user data: assertion_ref has unexpected format: ${String(u["assertion_ref"])}`,
          ),
        );
      }

      if (
        typeof u["fiscal_code"] !== "string" ||
        !fiscalCodePattern.test(u["fiscal_code"])
      ) {
        return err(
          new UnauthorizedError(
            "Invalid FIMS user data: fiscal_code is not a valid Italian fiscal code",
          ),
        );
      }

      return ok(userinfo as unknown as FimsUser);
    } catch (error) {
      return err(
        new UnauthorizedError(
          `Cannot retrieve FIMS user data: ${String(error)}`,
        ),
      );
    }
  },

  getAuthorizationUrl: async (
    state,
    nonce,
  ): Promise<Result<string, GenericError>> => {
    try {
      const client = await getClient(config);
      const url = client.authorizationUrl({
        nonce,
        redirect_uri: config.redirectUri,
        scope: config.scope,
        state,
      });
      return ok(url);
    } catch (error) {
      return err(
        new GenericError(`FIMS authorization URL error: ${String(error)}`),
      );
    }
  },
});
