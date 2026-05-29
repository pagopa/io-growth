import type { ArClientConfig } from "./config.js";

let globalConfig: ArClientConfig | undefined;

export const initArClient = (config: ArClientConfig): void => {
  globalConfig = config;
};

const getArClientConfig = (): ArClientConfig => {
  if (!globalConfig) {
    throw new Error(
      "AR client config not initialized. Call a create*Client(config) factory before making API calls.",
    );
  }
  return globalConfig;
};

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
