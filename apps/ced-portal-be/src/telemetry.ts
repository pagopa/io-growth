import {
  azureTracingConfigSchema,
  buildAzureTracingConfig,
  initTelemetry,
} from "@pagopa/io-core-adapter-tracing";

/**
 * Telemetry bootstrap.
 *
 * IMPORTANT!
 * This module MUST BE imported as the **very first** import in `main.ts` so Azure
 * Monitor / OpenTelemetry instrumentation is installed before any instrumented
 * library (the Fastify HTTP server, PostgreSQL, Redis, outbound fetch) is
 * loaded. ESM evaluates the first import's module graph before the rest, which
 * gives us the required ordering without a separate `NODE_OPTIONS` preload.
 *
 * Telemetry defaults to console logging when
 * `APPLICATIONINSIGHTS_CONNECTION_STRING` is not set, keeping local development
 * and tests side-effect free.
 */
const env = azureTracingConfigSchema.parse(process.env);

initTelemetry(buildAzureTracingConfig(env));
