import type { Agent, RequestInit as UndiciRequestInit } from "undici";

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
) => Promise<Response>;

/** TTL for the cached signing credentials (24 hours). */
const SIGNING_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

interface CachedSigningCredentials {
  readonly credentials: SigningCredentials;
  readonly expiresAt: number;
  readonly signingCa: string;
}

/**
 * Creates a fetch-compatible function that transparently applies INPS ModI P3:
 *  - mTLS client authentication (ID_AUTH_CHANNEL_02) via undici Agent
 *  - Request signing with AGID ModI JWT (INTEGRITY_REST_01 / ID_AUTH_REST_01)
 *  - P3 non-repudiation: verifies INPS signed response JWT + request_digest
 *
 * The returned function is used as the orval customFetch mutator in
 * io-core-adapter-inps-* packages.
 *
 * Identity headers (INPS-Identity-UserId, INPS-Identity-CodiceUfficio)
 * must be set on options.headers by the caller before invoking the
 * signed fetch. The signed fetch reads them, includes them in the JWT
 * signed_headers claim, and forwards them to INPS.
 *
 * Both the mTLS dispatcher and the signing credentials are cached for
 * SIGNING_CACHE_TTL_MS (24 h) to avoid per-request Key Vault round-trips.
 */
export const createSignedFetch = (options: {
  audience: string;
  config: ModiConfig;
  credentialProvider: ModiCredentialProvider;
}): SignedFetch => {
  const { audience, config, credentialProvider } = options;

  let cachedDispatcher: Agent | undefined;
  let cachedSigning: CachedSigningCredentials | undefined;

  const getDispatcher = async (): Promise<Agent> => {
    if (cachedDispatcher) return cachedDispatcher;

    const [credsResult, caResult] = await Promise.all([
      credentialProvider.getHttpsClientCredentials(),
      credentialProvider.getInpsHttpsCaChain(),
    ]);

    if (credsResult.isErr()) throw credsResult.error;
    if (caResult.isErr()) throw caResult.error;

    cachedDispatcher = createMtlsDispatcher({
      ca: caResult.value,
      cert: credsResult.value.cert,
      key: credsResult.value.key,
    });
    return cachedDispatcher;
  };

  const getSigningCredentials = async (): Promise<CachedSigningCredentials> => {
    const now = Date.now();
    if (cachedSigning && cachedSigning.expiresAt > now) return cachedSigning;

    const [signingResult, signingCaResult] = await Promise.all([
      credentialProvider.getSigningCredentials(),
      credentialProvider.getInpsSigningCaChain(),
    ]);
    if (signingResult.isErr()) throw signingResult.error;
    if (signingCaResult.isErr()) throw signingCaResult.error;

    cachedSigning = {
      credentials: signingResult.value,
      expiresAt: now + SIGNING_CACHE_TTL_MS,
      signingCa: signingCaResult.value,
    };
    return cachedSigning;
  };

  return async (url: string, requestInit: RequestInit): Promise<Response> => {
    const headers = new UndiciHeaders(
      requestInit.headers as ConstructorParameters<typeof UndiciHeaders>[0],
    );

    // Ensure Content-Type is set before digest computation
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    headers.set("Accept", "application/json");

    // Compute body digest (P3 INTEGRITY_REST_01)
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
    const digest = computeDigest(bodyForDigest);
    headers.set("Digest", digest);

    // Read identity context threaded via headers by the caller.
    // P3 requires a non-empty UserId in the signed JWT — fail fast rather than
    // silently sign a request with a blank identity.
    const userId = headers.get("INPS-Identity-UserId");
    if (!userId) {
      throw new Error(
        "INPS-Identity-UserId header is required but was not set by the caller",
      );
    }
    const codiceUfficio =
      headers.get("INPS-Identity-CodiceUfficio") ?? config.defaultCodiceUfficio;

    headers.set("INPS-Identity-UserId", userId);
    headers.set("INPS-Identity-CodiceUfficio", codiceUfficio);

    // Load signing credentials from cache (refreshed every 24 h)
    const { credentials: signingCredentials, signingCa } =
      await getSigningCredentials();

    // Sign the request JWT
    const tokenSigner = createTokenSigner(signingCredentials);
    const tokenResult = await tokenSigner.signRequest({
      audience,
      codiceUfficio,
      contentType: headers.get("Content-Type") ?? "application/json",
      digest,
      issuer: config.codiceEnte,
      userId,
    });
    if (tokenResult.isErr()) throw tokenResult.error;

    headers.set("Agid-JWT-Signature", tokenResult.value.jwt);

    // Execute request over mTLS
    const dispatcher = await getDispatcher();
    const fullUrl =
      url.startsWith("http://") || url.startsWith("https://")
        ? url
        : `${config.inpsBaseUrl}${url}`;

    const response = await undiciFetch(fullUrl, {
      ...(requestInit as UndiciRequestInit),
      dispatcher,
      headers,
    });

    // P3 non-repudiation: INPS must return a signed response JWT.
    // Fail closed — an absent header is a protocol violation under P3.
    const responseJwt = response.headers.get("Agid-JWT-Signature");
    if (!responseJwt) {
      throw new Error(
        "ModI P3 violation: INPS response is missing the required Agid-JWT-Signature header",
      );
    }
    const verifier = createResponseVerifier(signingCa);
    const verifyResult = await verifier.verify(responseJwt, digest);
    if (verifyResult.isErr()) throw verifyResult.error;

    return response as unknown as Response;
  };
};
