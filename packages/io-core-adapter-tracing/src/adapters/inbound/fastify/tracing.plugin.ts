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
