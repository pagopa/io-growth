import type { AzureTracingConfig } from "../config.js";
import type { TelemetryClient } from "../domain/ports/outbound/telemetry-client.port.js";

import { consoleTelemetryClient } from "../adapters/outbound/console/console-telemetry.client.js";

/**
 * Process-wide telemetry client registry.
 *
 * Telemetry initialization (`useAzureMonitor`) is an inherently global,
 * one-time side effect, so the active {@link TelemetryClient} is held in a
 * module-level singleton. This lets thin helpers such as `emitCustomEvent` be
 * imported anywhere without threading the client through every call site, while
 * the rest of the codebase still depends only on the {@link TelemetryClient}
 * port.
 *
 * Before {@link initTelemetry} is called, a safe no-op is active so emitting
 * events from un-initialized contexts (e.g. unit tests) is harmless.
 */
const noopTelemetryClient: TelemetryClient = {
  trackEvent: () => undefined,
  trackException: () => undefined,
  trackRequest: () => undefined,
};

let activeClient: TelemetryClient = noopTelemetryClient;

/**
 * Initialize tracing and register the resulting client as the process-wide
 * active client.
 *
 * - **With** `config.connectionString`: initializes Azure Monitor via
 *   `@pagopa/azure-tracing` and routes telemetry to Application Insights.
 * - **Without** `config.connectionString`: activates the console fallback that
 *   prints requests, exceptions, and custom events to stdout/stderr with ANSI
 *   colours. This is the default for local development — no Azure credentials
 *   required.
 *
 * Call this **as early as possible** in the application entry point — ideally
 * before importing the libraries you want instrumented — because Azure Monitor
 * patches modules (http, redis, postgres, …) at initialization time.
 *
 * @returns the active {@link TelemetryClient} (also retrievable via
 *   {@link getTelemetryClient}).
 */
export const initTelemetry = async (
  config: AzureTracingConfig,
): Promise<TelemetryClient> => {
  if (config.connectionString) {
    const { createAzureTracingClient } =
      await import("../adapters/outbound/azure-monitor/azure-tracing.client.js");
    activeClient = createAzureTracingClient(config);
  } else {
    activeClient = consoleTelemetryClient;
  }
  return activeClient;
};

/** Return the process-wide active {@link TelemetryClient}. */
export const getTelemetryClient = (): TelemetryClient => activeClient;
