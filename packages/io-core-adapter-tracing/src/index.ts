// Inbound adapter — Fastify plugin
export {
  tracingPlugin,
  type TracingPluginOptions,
} from "./adapters/inbound/fastify/tracing.plugin.js";

// Outbound adapter — Azure Monitor telemetry client
export { createAzureTracingClient } from "./adapters/outbound/azure-monitor/azure-tracing.client.js";

// Outbound adapter — Console telemetry client (local-dev fallback)
export { consoleTelemetryClient } from "./adapters/outbound/console/console-telemetry.client.js";

// Application — initialization and custom event emitter
export { emitCustomEvent } from "./application/emit-custom-event.js";
export {
  getTelemetryClient,
  initTelemetry,
} from "./application/telemetry-registry.js";

// Configuration schema and builder
export {
  type AzureTracingConfig,
  azureTracingConfigSchema,
  type AzureTracingEnvConfig,
  buildAzureTracingConfig,
} from "./config.js";

// Domain entities and ports
export type {
  CustomEvent,
  CustomEventPayload,
  ExceptionTelemetry,
  RequestTelemetry,
} from "./domain/entities.js";
export type { TelemetryClient } from "./domain/ports/outbound/telemetry-client.port.js";
