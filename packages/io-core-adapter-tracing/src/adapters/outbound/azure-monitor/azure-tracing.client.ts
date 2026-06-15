import type { AzureMonitorOpenTelemetryOptions } from "@azure/monitor-opentelemetry";

import { DefaultAzureCredential } from "@azure/identity";
import { initAzureMonitor } from "@pagopa/azure-tracing/azure-monitor";
import { emitCustomEvent as emitAzureCustomEvent } from "@pagopa/azure-tracing/logger";

import type { AzureTracingConfig } from "../../../config.js";
import type {
  CustomEvent,
  ExceptionTelemetry,
  RequestTelemetry,
} from "../../../domain/entities.js";
import type { TelemetryClient } from "../../../domain/ports/outbound/telemetry-client.port.js";

/** Custom event names used to map HTTP telemetry onto custom events. */
const REQUEST_EVENT_NAME = "http.request";
const EXCEPTION_EVENT_NAME = "http.exception";

/**
 * Build the `@azure/monitor-opentelemetry` options from our technology-agnostic
 * configuration. This is the **only** place that knows about Azure Monitor
 * specifics; everything else depends on {@link TelemetryClient}.
 */
const toAzureMonitorOptions = (
  config: AzureTracingConfig,
): AzureMonitorOpenTelemetryOptions => ({
  azureMonitorExporterOptions: {
    connectionString: config.connectionString,
    ...(config.entraIdAuthEnabled
      ? { credential: new DefaultAzureCredential() }
      : {}),
  },
  samplingRatio: config.samplingRatio,
});

/**
 * Create the Azure-backed implementation of {@link TelemetryClient}.
 *
 * Side effect: initializes Azure Monitor / OpenTelemetry instrumentation via
 * `@pagopa/azure-tracing`. To capture outbound HTTP/DB dependencies this must
 * run **before** the instrumented libraries are first used.
 *
 * Callers should use `initTelemetry` from the registry rather than calling
 * this factory directly. The registry handles the connection-string-absent
 * case by selecting the console fallback instead.
 */
export const createAzureTracingClient = (
  config: AzureTracingConfig,
): TelemetryClient => {
  if (config.serviceName) {
    // Reported as the Application Insights "cloud role name".
    process.env.OTEL_SERVICE_NAME ??= config.serviceName;
  }

  initAzureMonitor([], toAzureMonitorOptions(config));

  /**
   * Bridge to `@pagopa/azure-tracing`'s `emitCustomEvent`. The Azure logger
   * only accepts string attributes, so callers pass an already-stringified
   * record. Wrapped in a try/catch because telemetry must never throw into
   * business logic.
   */
  const emit = (
    name: string,
    attributes: Record<string, string>,
    caller: string,
  ): void => {
    try {
      emitAzureCustomEvent(name, attributes)(caller);
    } catch {
      // Telemetry is best-effort: swallow any transport/SDK error.
    }
  };

  return {
    trackEvent: <T>(event: CustomEvent<T>) =>
      emit(
        event.name,
        {
          caller: event.payload.caller,
          data: JSON.stringify(event.payload.data),
        },
        event.caller ?? event.payload.caller,
      ),
    trackException: (exception: ExceptionTelemetry) =>
      emit(
        EXCEPTION_EVENT_NAME,
        {
          message: exception.error.message,
          method: exception.method,
          name: exception.error.name,
          route: exception.route,
          stack: exception.error.stack ?? "",
        },
        exception.route,
      ),
    trackRequest: (request: RequestTelemetry) =>
      emit(
        REQUEST_EVENT_NAME,
        {
          durationMs: String(request.durationMs),
          method: request.method,
          route: request.route,
          statusCode: String(request.statusCode),
          success: String(request.success),
        },
        request.route,
      ),
  };
};
