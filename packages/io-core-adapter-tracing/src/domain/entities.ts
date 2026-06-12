/**
 * Domain entities for the tracing/telemetry cross-cutting concern.
 *
 * These plain types form the technology-agnostic contract used by every app
 * and package in the monorepo. They intentionally contain **no** reference to
 * `@pagopa/azure-tracing`, `@azure/monitor-opentelemetry` or OpenTelemetry, so
 * the underlying tracing implementation can change without touching callers.
 */

/** A named custom event together with its payload and optional caller context. */
export interface CustomEvent<T> {
  /** Optional caller context, falls back to {@link CustomEventPayload.caller}. */
  readonly caller?: string;
  readonly name: string;
  readonly payload: CustomEventPayload<T>;
}

/**
 * Payload carried by an application-level custom event.
 *
 * - `caller`: the component/handler/use-case that emitted the event.
 * - `data`: a serialized (typically `JSON.stringify`-ed) representation of the
 *   event-specific data.
 */
export interface CustomEventPayload<T> {
  readonly caller: string;
  readonly data: T;
}

/** Telemetry describing an exception thrown while serving a request. */
export interface ExceptionTelemetry {
  readonly error: Error;
  readonly method: string;
  /** Route pattern, e.g. `/operators/:id`. Used for grouping in Azure Monitor. */
  readonly route: string;
  /** Actual request URL with path params resolved, e.g. `/operators/01ABC`. */
  readonly url: string;
}

/** Telemetry describing the result of a single inbound HTTP request. */
export interface RequestTelemetry {
  readonly durationMs: number;
  readonly method: string;
  /** Route pattern, e.g. `/operators/:id`. Used for grouping in Azure Monitor. */
  readonly route: string;
  readonly statusCode: number;
  readonly success: boolean;
  /** Actual request URL with path params resolved, e.g. `/operators/01ABC`. */
  readonly url: string;
}
