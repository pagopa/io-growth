import type { Agent, RequestInit as UndiciRequestInit } from "undici";

import { BaseError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok, type Result } from "neverthrow";
import { fetch as undiciFetch, Headers as UndiciHeaders } from "undici";

import type { ModiConfig } from "./config.js";
import type {
  ModiCredentialProvider,
  SigningCredentials,
} from "./domain/ports/outbound/credential-provider.port.js";

import { computeDigest } from "./adapters/outbound/crypto/digest.js";
import { createResponseVerifier } from "./adapters/outbound/crypto/jose-response-verifier.js";
import { createTokenSigner } from "./adapters/outbound/crypto/jose-token-signer.js";
import { createMtlsDispatcher } from "./adapters/outbound/tls/mtls-dispatcher.js";

export type SignedFetch = (
  url: string,
  options: RequestInit,
) => Promise<Result<Response, BaseError>>;

/** Shared TTL for both the signing credentials and the mTLS dispatcher caches (24 hours). */
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

/** Undici Agent carrying the mTLS client certificate (ID_AUTH_CHANNEL_02 — all profiles). */
interface CachedDispatcher {
  readonly dispatcher: Agent | undefined;
  readonly expiresAt: number;
}

interface CachedSigningCredentials {
  readonly credentials: SigningCredentials;
  readonly expiresAt: number;
}

/**
 * Creates a fetch-compatible function that transparently applies the selected
 * AGID ModI interoperability profile.
 *
 * ## Profiles
 *
 * | Profile | `config.profile` | mTLS | Digest | Response JWT |
 * |---------|-----------------|------|--------|--------------|
 * | P1 — ID_AUTH_CHANNEL_02                   | `"P1"` | ✅ | ❌ | ❌ |
 * | P2 — ID_AUTH_CHANNEL_02 + CONF_ID_AUTH_01 | `"P2"` | ✅ | ✅ | ❌ |
 * | P3 — Full (non-repudiation)               | `"P3"` | ✅ | ✅ | ✅ required |
 *
 * ## Common behaviour (all profiles)
 * - Injects `Content-Type` / `Accept` headers.
 * - Reads `INPS-Identity-UserId` (required) and
 *   `INPS-Identity-CodiceUfficio` (falls back to `config.defaultCodiceUfficio`).
 * - P2/P3: Signs the request with a JWT placed in `Agid-JWT-Signature`.
 * - P2/P3: Caches signing credentials for 24 h to avoid per-request Key Vault round-trips.
 *
 * ## Profile guards
 * - All profiles: throws if `INPS-Identity-UserId` is absent or empty (fail-fast).
 * - P3 only: throws if the response is missing `Agid-JWT-Signature` (fail-closed).
 */
export const createSignedFetch = (options: {
  audience: string;
  config: ModiConfig;
  credentialProvider: ModiCredentialProvider;
}): SignedFetch => {
  const { audience, config, credentialProvider } = options;

  // ── All profiles: mTLS dispatcher cache (24 h TTL — allows certificate rotation) ─
  let cachedDispatcher: CachedDispatcher | undefined;
  const getDispatcher = async (): Promise<Agent | undefined> => {
    const now = Date.now();
    if (cachedDispatcher && cachedDispatcher.expiresAt > now) {
      return cachedDispatcher.dispatcher;
    }

    // mTLS secret names are optional: omit them when an upstream nginx proxy
    // handles the mTLS hop on the app’s behalf (local-dev). Set them for
    // direct app → INPS connections (production).
    const { httpsClientCert, httpsClientKey, inpsHttpsCa } = config.secretNames;
    if (!httpsClientCert || !httpsClientKey || !inpsHttpsCa) {
      cachedDispatcher = {
        dispatcher: undefined,
        expiresAt: now + CACHE_TTL_MS,
      };
      return undefined;
    }

    const [credsResult, caResult] = await Promise.all([
      credentialProvider.getHttpsClientCredentials(),
      credentialProvider.getInpsHttpsCaChain(),
    ]);
    if (credsResult.isErr()) throw credsResult.error;
    if (caResult.isErr()) throw caResult.error;

    const dispatcher = createMtlsDispatcher({
      ca: caResult.value,
      cert: credsResult.value.cert,
      key: credsResult.value.key,
    });
    cachedDispatcher = { dispatcher, expiresAt: now + CACHE_TTL_MS };
    return dispatcher;
  };

  // ── P2/P3 only: signing credentials cache (24 h TTL) ───────────────────────
  let cachedSigning: CachedSigningCredentials | undefined;
  // P3 only: signing CA cached alongside credentials
  let cachedSigningCa: string | undefined;

  const getSigningCredentials = async (): Promise<CachedSigningCredentials> => {
    const now = Date.now();
    if (cachedSigning && cachedSigning.expiresAt > now) return cachedSigning;

    const signingResult = await credentialProvider.getSigningCredentials();
    if (signingResult.isErr()) throw signingResult.error;

    cachedSigning = {
      credentials: signingResult.value,
      expiresAt: now + CACHE_TTL_MS,
    };

    // P3: refresh signing CA alongside credentials (same 24 h TTL)
    if (config.profile === "P3") {
      const signingCaResult = await credentialProvider.getInpsSigningCaChain();
      if (signingCaResult.isErr()) throw signingCaResult.error;
      cachedSigningCa = signingCaResult.value;
    }

    return cachedSigning;
  };

  return async (
    url: string,
    requestInit: RequestInit,
    // eslint-disable-next-line complexity
  ): Promise<Result<Response, BaseError>> => {
    try {
      const headers = new UndiciHeaders(
        requestInit.headers as ConstructorParameters<typeof UndiciHeaders>[0],
      );

      // ── Common: headers ───────────────────────────────────────────────────────
      if (!headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Accept", "application/json");

      // ── Common guard: UserId required (all profiles) ──────────────────────────
      const userId = headers.get("INPS-Identity-UserId");
      if (!userId) {
        return err(
          new GenericError(
            "INPS-Identity-UserId header is required but was not set by the caller",
          ),
        );
      }
      const codiceUfficio =
        headers.get("INPS-Identity-CodiceUfficio") ??
        config.defaultCodiceUfficio;
      headers.set("INPS-Identity-UserId", userId);
      headers.set("INPS-Identity-CodiceUfficio", codiceUfficio);

      // ── P2/P3: body digest ────────────────────────────────────────────────────
      let digest: string | undefined;
      if (config.profile === "P2" || config.profile === "P3") {
        const rawBody = requestInit.body;
        let bodyForDigest: Buffer | string = "";
        if (typeof rawBody === "string") {
          bodyForDigest = rawBody;
        } else if (rawBody instanceof Buffer) {
          bodyForDigest = rawBody;
        } else if (rawBody instanceof ArrayBuffer) {
          bodyForDigest = Buffer.from(rawBody);
        } else if (rawBody instanceof Uint8Array) {
          bodyForDigest = Buffer.from(rawBody);
        }
        digest = computeDigest(bodyForDigest);
        headers.set("Digest", digest);
      }

      // ── P2/P3: request signing (Agid-JWT-Signature) ──────────────────────────
      if (config.profile !== "P1") {
        const { credentials: signingCredentials } =
          await getSigningCredentials();
        const tokenSigner = createTokenSigner(signingCredentials);
        const tokenResult = await tokenSigner.signRequest({
          audience,
          codiceUfficio,
          contentType: headers.get("Content-Type") ?? "application/json",
          digest,
          issuer: config.codiceEnte,
          userId,
        });
        if (tokenResult.isErr()) return err(tokenResult.error);
        headers.set("Agid-JWT-Signature", tokenResult.value.jwt);
      }

      // ── All profiles: mTLS fetch (ID_AUTH_CHANNEL_02) ─────────────────────────
      const fullUrl =
        url.startsWith("http://") || url.startsWith("https://")
          ? url
          : `${config.inpsBaseUrl}${url}`;

      const fetchOptions: UndiciRequestInit = {
        ...(requestInit as UndiciRequestInit),
        headers,
      };

      const dispatcher = await getDispatcher();
      if (dispatcher !== undefined) {
        fetchOptions.dispatcher = dispatcher;
      }

      const response = await undiciFetch(fullUrl, fetchOptions);

      // ── P3 guard: response non-repudiation (fail-closed) ─────────────────────
      if (config.profile === "P3") {
        const responseJwt = response.headers.get("Agid-JWT-Signature");
        if (!responseJwt) {
          return err(
            new GenericError(
              "ModI P3 violation: INPS response is missing the required Agid-JWT-Signature header",
            ),
          );
        }
        // cachedSigningCa is always populated by getSigningCredentials() for P3
        const verifier = createResponseVerifier(cachedSigningCa as string);
        // digest is always set for P3 (set above in the P2/P3 block)
        const verifyResult = await verifier.verify(
          responseJwt,
          digest as string,
        );
        if (verifyResult.isErr()) return err(verifyResult.error);
      }

      return ok(response as unknown as Response);
    } catch (error) {
      if (error instanceof BaseError) return err(error);
      return err(new GenericError(String(error)));
    }
  };
};
