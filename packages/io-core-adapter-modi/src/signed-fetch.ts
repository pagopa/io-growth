import type { Agent, RequestInit as UndiciRequestInit } from "undici";

import { fetch as undiciFetch, Headers as UndiciHeaders } from "undici";

import type { ModiConfig } from "./config.js";
import type { ModiCredentialProvider } from "./domain/ports/outbound/credential-provider.port.js";

import { computeDigest } from "./adapters/outbound/crypto/digest.js";
import { createResponseVerifier } from "./adapters/outbound/crypto/jose-response-verifier.js";
import { createTokenSigner } from "./adapters/outbound/crypto/jose-token-signer.js";
import { createMtlsDispatcher } from "./adapters/outbound/tls/mtls-dispatcher.js";

export type SignedFetch = (
  url: string,
  options: RequestInit,
) => Promise<Response>;

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
 */
export const createSignedFetch = (options: {
  audience: string;
  config: ModiConfig;
  credentialProvider: ModiCredentialProvider;
}): SignedFetch => {
  const { audience, config, credentialProvider } = options;

  let cachedDispatcher: Agent | undefined;

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

    // Read identity context threaded via headers by the caller
    const userId = headers.get("INPS-Identity-UserId") ?? "";
    const codiceUfficio =
      headers.get("INPS-Identity-CodiceUfficio") ?? config.defaultCodiceUfficio;

    headers.set("INPS-Identity-UserId", userId);
    headers.set("INPS-Identity-CodiceUfficio", codiceUfficio);

    // Load signing credentials and INPS signing CA in parallel
    const [signingResult, signingCaResult] = await Promise.all([
      credentialProvider.getSigningCredentials(),
      credentialProvider.getInpsSigningCaChain(),
    ]);
    if (signingResult.isErr()) throw signingResult.error;
    if (signingCaResult.isErr()) throw signingCaResult.error;

    // Sign the request JWT
    const tokenSigner = createTokenSigner(signingResult.value);
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

    // P3 non-repudiation: verify INPS signed response
    const responseJwt = response.headers.get("Agid-JWT-Signature");
    if (responseJwt) {
      const verifier = createResponseVerifier(signingCaResult.value);
      const verifyResult = await verifier.verify(responseJwt, digest);
      if (verifyResult.isErr()) throw verifyResult.error;
    }

    return response as unknown as Response;
  };
};
