import type { ArClientConfig } from "./config.js";

export type CustomFetch = <T>(url: string, options?: RequestInit) => Promise<T>;

/**
 * Creates a fetch function bound to a specific {@link ArClientConfig}.
 * The returned function prepends `baseUrl` and injects the subscription key
 * header on every request — no global state, no AsyncLocalStorage.
 */
export const createCustomFetch =
  (config: ArClientConfig): CustomFetch =>
  async <T>(url: string, options: RequestInit = {}): Promise<T> => {
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
