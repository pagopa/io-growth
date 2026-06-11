import type { CustomEventPayload } from "../domain/entities.js";

import { getTelemetryClient } from "./telemetry-registry.js";

/**
 * Emit an application-level custom event.
 *
 * Thin, technology-agnostic facade over the active {@link TelemetryClient}.
 * Internally it delegates to the Azure adapter, but callers never import
 * `@pagopa/azure-tracing` — swapping the tracing backend leaves this signature
 * untouched.
 *
 * @example
 * ```ts
 * emitCustomEvent(eventName, { caller, data: JSON.stringify(data) })(caller);
 * ```
 *
 * @param eventName the custom event name.
 * @param payload the event payload (`caller` plus serialized `data`).
 * @returns a function accepting the caller context that performs the emission.
 */
export const emitCustomEvent =
  (eventName: string, payload: CustomEventPayload) =>
  (callerContext?: string): void => {
    getTelemetryClient().trackEvent({
      caller: callerContext ?? payload.caller,
      name: eventName,
      payload,
    });
  };
