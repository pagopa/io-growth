import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import type { InpsCedConfig } from "./config.js";

/**
 * Minimal structural subset of `TelemetryClient.trackException` used by this
 * package. Defined locally so the package does not take a hard dependency on
 * `@pagopa/io-core-adapter-tracing`; pass `getTelemetryClient()` from the app
 * layer and TypeScript's structural typing handles the rest.
 */
export interface InpsCedTelemetry {
  readonly trackException: (exception: {
    readonly error: Error;
    readonly method: string;
    readonly route: string;
    readonly url: string;
  }) => void;
}

export interface InpsIdentityContext {
  readonly codiceUfficio: string;
  readonly userId: string;
}

let globalConfig: InpsCedConfig | undefined;
let globalSignedFetch: SignedFetch | undefined;
let globalGetIdentity: (() => InpsIdentityContext | undefined) | undefined;
let globalTelemetry: InpsCedTelemetry | undefined;

export const initInpsCedClient = (
  config: InpsCedConfig,
  signedFetch: SignedFetch,
  /**
   * A getter function supplied by the **app layer** that resolves the
   * `InpsIdentityContext` for the current request.  The app owns the
   * `AsyncLocalStorage` (or any other mechanism) and maps its session data
   * to this shape.  The adapter never touches `async_hooks` directly — it
   * only calls this function at fetch time.
   *
   * Pattern mirrors how `ced-portal-be` injects `getRequestSession` into
   * adapters that need session data.
   */
  getIdentity: () => InpsIdentityContext | undefined,
  /**
   * Optional telemetry client injected by the app layer (e.g.
   * `getTelemetryClient()` from `@pagopa/io-core-adapter-tracing`). When
   * provided, upstream non-2xx responses are recorded as exceptions so they
   * appear in Application Insights alongside the inbound request trace.
   */
  telemetry?: InpsCedTelemetry,
): void => {
  globalConfig = config;
  globalSignedFetch = signedFetch;
  globalGetIdentity = getIdentity;
  globalTelemetry = telemetry;
};

const getClient = (): {
  config: InpsCedConfig;
  getIdentity: () => InpsIdentityContext | undefined;
  signedFetch: SignedFetch;
} => {
  if (!globalConfig || !globalSignedFetch || !globalGetIdentity) {
    throw new Error(
      "inps-ced client not initialised. Call initInpsCedClient() in your composition root.",
    );
  }
  return {
    config: globalConfig,
    getIdentity: globalGetIdentity,
    signedFetch: globalSignedFetch,
  };
};

/**
 * Reads the full response body as text while tolerating an abrupt connection
 * termination.
 *
 * INPS sometimes sends a complete 4xx JSON payload (ProblemDetails) and then
 * closes the mTLS connection without a clean TLS `close_notify`. undici
 * surfaces this as a `TypeError: terminated` and — critically —
 * `Response.text()` rejects and discards every byte it had already buffered,
 * so the payload (e.g. `{ "errors": [{ "Codice": 204, ... }] }`) is lost and
 * the trace only shows the opaque "terminated" error.
 *
 * Draining the body stream chunk-by-chunk keeps whatever arrived before the
 * socket died — usually the complete payload. The termination is returned
 * (not thrown) so the caller can still parse a fully-received body; genuinely
 * truncated bodies simply fail the downstream `JSON.parse` and fall back to
 * `data: undefined`.
 */
const readBodyText = async (
  response: Response,
): Promise<{ readonly terminated?: unknown; readonly text: string }> => {
  const stream = response.body;
  // Non-stream bodies (e.g. test doubles) fall back to text().
  if (!stream || typeof stream.getReader !== "function") {
    return { text: await response.text() };
  }

  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let text = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    return { text };
  } catch (terminated) {
    // Keep the bytes decoded so far — often the complete payload INPS sent
    // right before resetting the connection.
    text += decoder.decode();
    return { terminated, text };
  }
};

/**
 * orval customFetch mutator.
 *
 * Calls the identity getter injected at initialisation time to obtain
 * per-request INPS identity headers.  The getter is owned and implemented
 * by the app layer (`ced-card-request-be`), which maps its own
 * `AsyncLocalStorage`-backed session to the `InpsIdentityContext` shape.
 * This adapter package has no `async_hooks` dependency.
 *
 * The base URL is resolved here from `InpsCedConfig`; orval generates paths only.
 */
export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const { config, getIdentity, signedFetch } = getClient();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const identity = getIdentity();
  if (identity) {
    headers.set("INPS-Identity-UserId", identity.userId);
    headers.set("INPS-Identity-CodiceUfficio", identity.codiceUfficio);
  }

  const fetchResult = await signedFetch(`${config.baseUrl}${url}`, {
    ...options,
    headers: Object.fromEntries(headers.entries()),
  });
  if (fetchResult.isErr()) throw fetchResult.error;
  const response = fetchResult.value;

  const hasBody =
    response.status !== 204 &&
    response.status !== 205 &&
    response.status !== 304 &&
    response.body !== null &&
    response.headers.get("content-length") !== "0";

  let data: unknown;
  if (hasBody) {
    const { terminated, text: rawBody } = await readBodyText(response);

    if (response.status < 200 || response.status >= 300) {
      // Log ALL non-2xx responses unconditionally, including non-JSON or empty
      // bodies. When the connection was terminated mid-read, surface the
      // underlying cause alongside whatever payload we recovered so the trace
      // shows the INPS ProblemDetails instead of an opaque "terminated".
      const bodyPreview = rawBody || "(empty)";
      globalTelemetry?.trackException({
        error: new Error(
          `HTTP ${String(response.status)} from upstream` +
            ` content-type=${response.headers.get("content-type") ?? "unknown"}` +
            ` body=${bodyPreview}` +
            (terminated
              ? ` (connection terminated: ${String(
                  (terminated as { cause?: unknown }).cause ?? terminated,
                )})`
              : ""),
        ),
        method: options.method ?? "POST",
        route: url,
        url: `${config.baseUrl}${url}`,
      });
      // Don't throw on non-JSON error bodies -- let the adapter handle the
      // status code. data=undefined is safe; adapters check response.status first.
      try {
        data = JSON.parse(rawBody);
      } catch {
        data = undefined;
      }
    } else {
      // 2xx: the contract requires a valid, fully-received JSON body -- throw
      // if the connection was terminated or the payload is malformed.
      if (terminated) throw terminated;
      data = JSON.parse(rawBody);
    }
  }

  return { data, headers: response.headers, status: response.status } as T;
};
