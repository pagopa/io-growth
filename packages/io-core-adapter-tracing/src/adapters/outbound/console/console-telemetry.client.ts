import type {
  CustomEvent,
  ExceptionTelemetry,
  RequestTelemetry,
} from "../../../domain/entities.js";
import type { TelemetryClient } from "../../../domain/ports/outbound/telemetry-client.port.js";

/** ANSI colour helpers — lightweight, no extra deps. */
const dim = (s: string): string => `\x1b[2m${s}\x1b[0m`;
const green = (s: string): string => `\x1b[32m${s}\x1b[0m`;
const yellow = (s: string): string => `\x1b[33m${s}\x1b[0m`;
const red = (s: string): string => `\x1b[31m${s}\x1b[0m`;
const cyan = (s: string): string => `\x1b[36m${s}\x1b[0m`;

const PREFIX = dim("[tracing]");

const statusColour = (code: number): ((s: string) => string) => {
  if (code < 400) return green;
  if (code < 500) return yellow;
  return red;
};

/**
 * A {@link TelemetryClient} that prints telemetry to `console.log`/`console.error`.
 *
 * Used automatically when `APPLICATIONINSIGHTS_CONNECTION_STRING` is not set
 * (local development). It gives developers visibility into request durations,
 * status codes and thrown exceptions without requiring any Azure configuration.
 */
export const consoleTelemetryClient: TelemetryClient = {
  trackEvent: <T>(event: CustomEvent<T>): void => {
    const caller = event.caller ?? event.payload.caller;
    console.log(
      PREFIX,
      cyan("event"),
      event.name,
      dim(`caller=${caller}`),
      dim(`data=${event.payload.data}`),
    );
  },

  trackException: (exception: ExceptionTelemetry): void => {
    console.error(
      PREFIX,
      red("exception"),
      `${exception.method} ${exception.url}`,
      dim(`route=${exception.route}`),
      dim(`name=${exception.error.name}`),
      exception.error.message,
    );
    if (exception.error.stack) {
      console.error(dim(exception.error.stack));
    }
  },

  trackRequest: (request: RequestTelemetry): void => {
    const colour = statusColour(request.statusCode);
    console.log(
      PREFIX,
      colour(`${request.method} ${request.url}`),
      colour(String(request.statusCode)),
      dim(`${Math.round(request.durationMs)}ms`),
      dim(`route=${request.route}`),
    );
  },
};
