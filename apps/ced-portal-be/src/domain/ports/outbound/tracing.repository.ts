export interface TracingEventPayload {
  readonly caller: string;
  readonly data: unknown;
}

/**
 * Telemetry is best-effort: implementations must never throw, so methods do
 * not return a `Result`.
 */
export interface TracingRepository {
  readonly emitEvent: (name: string, payload: TracingEventPayload) => void;
  /** Runs `func`, emitting start/end events around it, and returns its result. */
  readonly traceExecution: <O>(
    func: () => Promise<O>,
    caller: string,
    environment: string,
  ) => Promise<O>;
}
