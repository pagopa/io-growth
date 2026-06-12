import type {
  CustomEvent,
  ExceptionTelemetry,
  RequestTelemetry,
} from "../../entities.js";

/**
 * Outbound port for emitting telemetry.
 *
 * This is the single contract that the rest of the monorepo depends on. The
 * concrete implementation (currently backed by `@pagopa/azure-tracing`) lives
 * in `adapters/outbound`. Swapping the tracing technology only requires a new
 * adapter implementing this interface — callers stay untouched.
 *
 * Telemetry is a best-effort, fire-and-forget side effect: methods return
 * `void` and must **never** throw. Failures are swallowed by the adapter so a
 * monitoring outage can never break business logic.
 */
export interface TelemetryClient {
  /** Emit an application-level custom event. */
  readonly trackEvent: <T>(event: CustomEvent<T>) => void;
  /** Emit telemetry for a thrown, request-scoped exception. */
  readonly trackException: (exception: ExceptionTelemetry) => void;
  /** Emit telemetry for a completed inbound HTTP request. */
  readonly trackRequest: (request: RequestTelemetry) => void;
}
