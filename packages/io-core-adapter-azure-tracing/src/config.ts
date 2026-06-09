import { z } from "zod";

/**
 * Shared Zod schema for the Azure tracing environment variables.
 *
 * Apps should `extend` this schema with their own app-specific fields.
 *
 * @see https://dx.pagopa.it/docs/azure/monitoring/azure-tracing
 */
export const azureTracingConfigSchema = z.object({
  /**
   * Application Insights instrumentation key. When omitted, telemetry falls
   * back to the console adapter, which is convenient for local development and
   * tests.
   */
  APPINSIGHTS_INSTRUMENTATION_KEY: z.string().uuid().optional(),
  /**
   * Percentage of traces (0-100) forwarded to Application Insights.
   * Defaults to 5, matching the `@pagopa/azure-tracing` default.
   */
  APPINSIGHTS_SAMPLING_PERCENTAGE: z.coerce.number().min(0).max(100).default(5),
  /**
   * Enable Microsoft Entra ID authentication via `DefaultAzureCredential`
   * instead of connection-string-only auth (recommended for production).
   */
  APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

/**
 * Strongly-typed, technology-agnostic configuration consumed by
 * `initTelemetry`. Built from the validated environment variables.
 */
export interface AzureTracingConfig {
  /**
   * Application Insights connection string derived from the instrumentation key.
   * `undefined` when no key is configured — triggers the console fallback.
   */
  readonly connectionString?: string;
  /** When `true`, authenticate with `DefaultAzureCredential` (Entra ID). */
  readonly entraIdAuthEnabled: boolean;
  /** Sampling ratio in the [0, 1] range derived from the percentage. */
  readonly samplingRatio: number;
  /** Logical cloud role name reported to Application Insights. */
  readonly serviceName?: string;
}

export type AzureTracingEnvConfig = z.infer<typeof azureTracingConfigSchema>;

/**
 * Map validated env vars to the strongly-typed {@link AzureTracingConfig}
 * consumed by `initTelemetry`.
 *
 * @param env validated environment variables.
 * @param serviceName optional cloud role name (e.g. the app/service name).
 */
export const buildAzureTracingConfig = (
  env: AzureTracingEnvConfig,
  serviceName?: string,
): AzureTracingConfig => ({
  connectionString: env.APPINSIGHTS_INSTRUMENTATION_KEY
    ? `InstrumentationKey=${env.APPINSIGHTS_INSTRUMENTATION_KEY}`
    : undefined,
  entraIdAuthEnabled: env.APPLICATIONINSIGHTS_ENTRA_ID_AUTH_ENABLED ?? false,
  samplingRatio: env.APPINSIGHTS_SAMPLING_PERCENTAGE / 100,
  serviceName,
});
