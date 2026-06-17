import { z } from "zod";

/**
 * Shared Zod schema for all AR (Area Riservata) environment variables.
 * Apps consuming this adapter should merge this schema into their own AppConfig.
 */
export const arConfigSchema = z.object({
  AR_API_KEY: z.string().min(1),
  AR_API_KEY_TEST: z.string().min(1),
  AR_ENDPOINT: z.string().url(),
  AR_ENDPOINT_TEST: z.string().url(),
});

export interface ArClientConfig {
  readonly baseUrl: string;
  readonly subscriptionKey: string;
}

export type ArEnvConfig = z.infer<typeof arConfigSchema>;

/**
 * Map validated AR env vars to the strongly-typed config object consumed by
 * the AR client factories.
 */
export const buildArConfig = (config: ArEnvConfig): ArClientConfig => ({
  baseUrl: config.AR_ENDPOINT,
  subscriptionKey: config.AR_API_KEY,
});

export const buildArTestConfig = (config: ArEnvConfig): ArClientConfig => ({
  baseUrl: config.AR_ENDPOINT_TEST,
  subscriptionKey: config.AR_API_KEY_TEST,
});
