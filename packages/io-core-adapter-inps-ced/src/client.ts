import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import type { InpsCedConfig } from "./config.js";

export interface InpsIdentityContext {
  readonly codiceUfficio: string;
  readonly userId: string;
}

let globalConfig: InpsCedConfig | undefined;
let globalSignedFetch: SignedFetch | undefined;
let globalGetIdentity: (() => InpsIdentityContext | undefined) | undefined;

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
): void => {
  globalConfig = config;
  globalSignedFetch = signedFetch;
  globalGetIdentity = getIdentity;
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

  const data = !hasBody ? undefined : await response.json();

  return { data, headers: response.headers, status: response.status } as T;
};
