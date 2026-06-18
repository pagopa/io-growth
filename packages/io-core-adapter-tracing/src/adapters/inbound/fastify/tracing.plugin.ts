import type { FastifyPluginCallback } from "fastify";

import fp from "fastify-plugin";

import type { TelemetryClient } from "../../../domain/ports/outbound/telemetry-client.port.js";

import { getTelemetryClient } from "../../../application/telemetry-registry.js";

export interface TracingPluginOptions {
  /**
   * Telemetry client used to emit request/exception telemetry. Defaults to the
   * process-wide client registered by `initTelemetry`, so in practice apps only
   * need `app.register(tracingPlugin)`.
   */
  readonly client?: TelemetryClient;
}

/**
 * Strip the query string from a URL, returning only the path.
 */
const stripQueryParams = (url: string): string => {
  const idx = url.indexOf("?");
  return idx === -1 ? url : url.slice(0, idx);
};

/**
 * Resolve the route pattern (e.g. `/operators/:id`) so telemetry is aggregated
 * per route rather than per concrete URL. Falls back to the raw URL (without
 * query params) when no route matched (e.g. 404s).
 */
const resolveRoute = (url: string | undefined, rawUrl: string): string =>
  url ?? stripQueryParams(rawUrl);

const plugin: FastifyPluginCallback<TracingPluginOptions> = (
  app,
  opts,
  done,
) => {
  const client = opts.client ?? getTelemetryClient();

  // Fires for every completed response (success or error), capturing the
  // status code and the request duration measured by Fastify.
  app.addHook("onResponse", (request, reply, hookDone) => {
    client.trackRequest({
      durationMs: reply.elapsedTime,
      method: request.method,
      route: resolveRoute(request.routeOptions.url, request.url),
      statusCode: reply.statusCode,
      success: reply.statusCode < 500,
      url: stripQueryParams(request.url),
    });
    hookDone();
  });

  // Fires before every response is sent. For error responses serialised as
  // Problem Details (application/problem+json) by `sendErrorResponse`, the
  // Fastify `onError` hook never fires because the handler calls
  // `reply.send(plainObject)` rather than throwing. This hook bridges that gap
  // by creating a synthetic Error from the `detail` field and forwarding it to
  // the telemetry client so 4xx/5xx messages are visible in Application Insights.
  app.addHook("onSend", (request, reply, payload, hookDone) => {
    const contentType = reply.getHeader("content-type");
    if (
      reply.statusCode >= 400 &&
      typeof contentType === "string" &&
      contentType.includes("application/problem+json") &&
      typeof payload === "string"
    ) {
      try {
        const body = JSON.parse(payload) as { detail?: string; title?: string };
        const message = body.detail ?? `HTTP ${reply.statusCode}`;
        const error = new Error(message);
        error.name =
          body.title ??
          (reply.statusCode >= 500 ? "ServerError" : "ClientError");
        client.trackException({
          error,
          method: request.method,
          route: resolveRoute(request.routeOptions.url, request.url),
          url: stripQueryParams(request.url),
        });
      } catch {
        // best-effort — never block the response
      }
    }
    hookDone();
  });

  // Fires whenever a handler throws / rejects, capturing the exception details.
  app.addHook("onError", (request, _reply, error, hookDone) => {
    client.trackException({
      error,
      method: request.method,
      route: resolveRoute(request.routeOptions.url, request.url),
      url: stripQueryParams(request.url),
    });
    hookDone();
  });

  done();
};

/**
 * Fastify plugin that automatically tracks every endpoint result.
 *
 * Wrapped with `fastify-plugin` so the lifecycle hooks are registered on the
 * **root** instance and therefore apply to all routes, regardless of where the
 * plugin is registered.
 *
 * @example
 * ```ts
 * await app.register(tracingPlugin);
 * ```
 */
export const tracingPlugin = fp<TracingPluginOptions>(plugin, {
  fastify: "5.x",
  name: "io-core-tracing",
});
