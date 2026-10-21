import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import type { InpsCedConfig } from "./config.js";

export type CustomFetch = <T>(url: string, options?: RequestInit) => Promise<T>;

export interface InpsCedClientOptions {
  readonly config: InpsCedConfig;
  /**
   * A getter function supplied by the **app layer** that resolves the
   * `InpsIdentityContext` for the current request.  The app owns the
   * `AsyncLocalStorage` (or any other mechanism) and maps its session data
   * to this shape.  The adapter never touches `async_hooks` directly — it
   * only calls this function at fetch time.
   */
  readonly getIdentity: () => InpsIdentityContext | undefined;
  readonly signedFetch: SignedFetch;
  /**
   * Optional telemetry client injected by the app layer (e.g.
   * `getTelemetryClient()` from `@pagopa/io-core-adapter-tracing`). When
   * provided, upstream non-2xx responses are recorded as exceptions so they
   * appear in Application Insights alongside the inbound request trace.
   */
  readonly telemetry?: InpsCedTelemetry;
}

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
 * Creates a fetch function bound to the given INPS client options.
 *
 * Calls the injected identity getter to obtain per-request INPS identity
 * headers; the getter is owned by the app layer, so this package has no
 * `async_hooks` dependency and no global state.
 *
 * The base URL is resolved here from `InpsCedConfig`; orval generates paths only.
 */
export const createCustomFetch = ({
  config,
  getIdentity,
  signedFetch,
  telemetry,
}: InpsCedClientOptions): CustomFetch =>
  async function customFetch<T>(
    url: string,
    options: RequestInit = {},
  ): Promise<T> {
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    // Request an uncompressed response (like plain `curl`). undici otherwise
    // auto-adds `Accept-Encoding: gzip, deflate`, so INPS gzips the body. When
    // INPS closes the mTLS connection uncleanly (no TLS close_notify), a
    // truncated gzip stream decompresses to ZERO bytes and the ProblemDetails
    // payload is lost — surfacing as `rejected: undefined`. An identity-encoded
    // body stays readable, so `readBodyText` can still recover the JSON.
    headers.set("Accept-Encoding", "identity");

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
        telemetry?.trackException({
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

/**
 * Stub kept so orval-generated endpoint files — which statically import this
 * symbol — continue to compile. Adapters must never call it directly; use a
 * bound instance obtained from {@link createCustomFetch}.
 */
export const customFetch: CustomFetch = () =>
  Promise.reject(
    new Error(
      "customFetch must not be called directly. Use createCustomFetch() to obtain a bound instance.",
    ),
  );
