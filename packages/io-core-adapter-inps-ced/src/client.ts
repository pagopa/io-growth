import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import { AsyncLocalStorage } from "node:async_hooks";

import type { InpsCedConfig } from "./config.js";

export interface InpsIdentityContext {
  readonly codiceUfficio: string;
  readonly userId: string;
}

/**
 * Per-request identity store. Populated by the outbound adapter before
 * calling each generated endpoint function so concurrent requests do not
 * share identity state.
 */
export const identityStore = new AsyncLocalStorage<InpsIdentityContext>();

let globalConfig: InpsCedConfig | undefined;
let globalSignedFetch: SignedFetch | undefined;

export const initInpsCedClient = (
  config: InpsCedConfig,
  signedFetch: SignedFetch,
): void => {
  globalConfig = config;
  globalSignedFetch = signedFetch;
};

const getClient = (): { config: InpsCedConfig; signedFetch: SignedFetch } => {
  if (!globalConfig || !globalSignedFetch) {
    throw new Error(
      "inps-ced client not initialised. Call initInpsCedClient() in your composition root.",
    );
  }
  return { config: globalConfig, signedFetch: globalSignedFetch };
};

/**
 * orval customFetch mutator.
 *
 * Reads identity from AsyncLocalStorage (populated per-call by the outbound
 * adapter) and sets INPS-Identity-* headers before delegating to the ModI
 * signed fetch, which includes them in the JWT signed_headers claim.
 *
 * The base URL is resolved here from InpsCedConfig; orval generates paths only.
 */
export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const { config, signedFetch } = getClient();

  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  headers.set("Accept", "application/json");

  const identity = identityStore.getStore();
  if (identity) {
    headers.set("INPS-Identity-UserId", identity.userId);
    headers.set("INPS-Identity-CodiceUfficio", identity.codiceUfficio);
  }

  const response = await signedFetch(`${config.baseUrl}${url}`, {
    ...options,
    headers: Object.fromEntries(headers.entries()),
  });

  const hasBody =
    response.status !== 204 &&
    response.status !== 205 &&
    response.status !== 304 &&
    response.body !== null &&
    response.headers.get("content-length") !== "0";

  const data = !hasBody ? undefined : await response.json();

  return { data, headers: response.headers, status: response.status } as T;
};
