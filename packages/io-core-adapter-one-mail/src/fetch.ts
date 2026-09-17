import type { OneMailConfig } from "./config.js";

export type CustomFetch = <T>(url: string, options?: RequestInit) => Promise<T>;

/**
 * Creates a fetch function bound to a specific {@link OneMailConfig}.
 * The returned function prepends `baseUrl` and injects the `x-api-key`
 * header on every request — no global state, no AsyncLocalStorage.
 */
export const createCustomFetch =
  (config: OneMailConfig): CustomFetch =>
  async <T>(url: string, options: RequestInit = {}): Promise<T> => {
    const fullUrl = `${config.baseUrl}${url}`;
    const headers = new Headers(options.headers);
    headers.set("x-api-key", config.apiKey);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");

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
        : await response.text();

    return { data, headers: response.headers, status: response.status } as T;
  };

/**
 * Stub kept so orval-generated endpoint files — which statically import this
 * symbol — continue to compile. Adapters must never call this directly;
 * instead inject a bound instance obtained from {@link createCustomFetch}.
 */
export const customFetch: CustomFetch = () =>
  Promise.reject(
    new Error(
      "customFetch must not be called directly. Use createCustomFetch() to obtain a bound instance.",
    ),
  );
