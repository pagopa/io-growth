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
    const rawBody = await response.text();
    if (response.status < 200 || response.status >= 300) {
      globalTelemetry?.trackException({
        error: new Error(
          `HTTP ${String(response.status)} from upstream` +
            ` content-type=${response.headers.get("content-type") ?? "unknown"}` +
            ` body=${rawBody.slice(0, 2000)}`,
        ),
        method: options.method ?? "POST",
        route: url,
        url: `${config.baseUrl}${url}`,
      });
    }
    try {
      data = JSON.parse(rawBody);
    } catch {
      throw new SyntaxError(
        `upstream returned non-JSON (status=${String(response.status)}, content-type=${response.headers.get("content-type") ?? "unknown"}): ${rawBody.slice(0, 500)}`,
      );
    }
  }

  return { data, headers: response.headers, status: response.status } as T;
};
