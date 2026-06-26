import { AsyncLocalStorage } from "node:async_hooks";

import type { ArClientConfig } from "./config.js";

/**
 * Per-call configuration storage. Each AR client binds its own
 * {@link ArClientConfig} around every request via {@link withArConfig}, so a
 * test and a prod client can coexist in the same process without any global
 * mutable state.
 */
const configStorage = new AsyncLocalStorage<ArClientConfig>();

const getArClientConfig = (): ArClientConfig => {
  const config = configStorage.getStore();
  if (!config) {
    throw new Error(
      "AR client config is not set. AR requests must run inside withArConfig() (createArClient() handles this for you).",
    );
  }
  return config;
};

/**
 * Runs `fn` with the given {@link ArClientConfig} bound for the duration of the
 * (possibly async) call, so {@link customFetch} can resolve the right endpoint
 * and subscription key for this specific client instance.
 */
export const withArConfig = <T>(
  config: ArClientConfig,
  fn: () => Promise<T>,
): Promise<T> => configStorage.run(config, fn);

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const config = getArClientConfig();

  const fullUrl = `${config.baseUrl}${url}`;
  const headers = new Headers(options.headers);
  headers.set("Ocp-Apim-Subscription-Key", config.subscriptionKey);

  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  const contentType = response.headers.get("content-type");
  const hasBody =
    response.status !== 204 &&
    response.status !== 205 &&
    response.status !== 304 &&
    response.body !== null &&
    response.headers.get("content-length") !== "0";

  const data = !hasBody
    ? undefined
    : contentType?.includes("application/json")
      ? await response.json()
      : await response.blob();

  return { data, headers: response.headers, status: response.status } as T;
};
