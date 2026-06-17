import type { ArClientConfig } from "./config.js";

let configGetter: (() => ArClientConfig) | undefined;

export const initArClient = (getter: () => ArClientConfig): void => {
  configGetter = getter;
};

const getArClientConfig = (): ArClientConfig => {
  if (!configGetter) {
    throw new Error(
      "AR client not initialized. Call initArClient() before making API calls.",
    );
  }
  return configGetter();
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
