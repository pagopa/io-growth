import type {
  FastifyInstance,
  FastifyPluginCallback,
  FastifyReply,
  FastifyRequest,
} from "fastify";

import { beforeEach, describe, expect, it, vi } from "vitest";

import type { TelemetryClient } from "../../../../domain/ports/outbound/telemetry-client.port.js";

import { tracingPlugin, type TracingPluginOptions } from "../tracing.plugin.js";

// Cast once — fp() changes the exported signature but the underlying callback
// is still a FastifyPluginCallback, so the cast is safe for test invocation.
const plugin =
  tracingPlugin as unknown as FastifyPluginCallback<TracingPluginOptions>;

// eslint-disable-next-line max-lines-per-function
describe("Fastify Tracing Plugin", () => {
  let mockClient: TelemetryClient;
  let mockApp: Partial<FastifyInstance>;
  let hookCallbacks: Record<string, ((...args: unknown[]) => unknown)[]>;

  beforeEach(() => {
    // Mock telemetry client
    mockClient = {
      trackEvent: vi.fn(),
      trackException: vi.fn(),
      trackRequest: vi.fn(),
    };

    // Store hook callbacks for manual invocation
    hookCallbacks = {
      onError: [],
      onResponse: [],
      onSend: [],
    };

    // Mock Fastify instance
    mockApp = {
      addHook: vi.fn(
        (event: string, callback: (...args: unknown[]) => unknown) => {
          if (!hookCallbacks[event]) {
            hookCallbacks[event] = [];
          }
          hookCallbacks[event].push(callback);
          return mockApp as FastifyInstance;
        },
      ) as unknown as FastifyInstance["addHook"],
    };
  });

  describe("plugin registration", () => {
    it("should register three hooks (onResponse, onSend and onError)", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          expect(mockApp.addHook).toHaveBeenCalledTimes(3);
          expect(mockApp.addHook).toHaveBeenCalledWith(
            "onResponse",
            expect.any(Function),
          );
          expect(mockApp.addHook).toHaveBeenCalledWith(
            "onSend",
            expect.any(Function),
          );
          expect(mockApp.addHook).toHaveBeenCalledWith(
            "onError",
            expect.any(Function),
          );
          done();
        });
      }));

    it("should use provided client from options", () =>
      new Promise<void>((done) => {
        const customClient = {
          trackEvent: vi.fn(),
          trackException: vi.fn(),
          trackRequest: vi.fn(),
        };

        plugin(mockApp as FastifyInstance, { client: customClient }, () => {
          expect(mockApp.addHook).toHaveBeenCalledTimes(3);
          done();
        });
      }));

    it("should fallback to default client when not provided in options", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, {}, () => {
          // Should succeed without throwing
          expect(mockApp.addHook).toHaveBeenCalledTimes(3);
          done();
        });
      }));
  });

  describe("onResponse hook", () => {
    it("should track successful request (2xx)", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onResponseCallback = hookCallbacks.onResponse[0];

          const mockRequest = {
            method: "GET",
            routeOptions: { url: "/api/users/:id" },
            url: "/api/users/123",
          } as Partial<FastifyRequest>;

          const mockReply = {
            elapsedTime: 42.5,
            statusCode: 200,
          } as Partial<FastifyReply>;

          let hookDoneCalled = false;
          const hookDone = () => {
            hookDoneCalled = true;
          };

          onResponseCallback(mockRequest, mockReply, hookDone);

          expect(hookDoneCalled).toBe(true);
          expect(mockClient.trackRequest).toHaveBeenCalledWith({
            durationMs: 42.5,
            method: "GET",
            route: "/api/users/:id",
            statusCode: 200,
            success: true,
            url: "/api/users/123",
          });
          done();
        });
      }));

    it("should track 4xx response — success=true because only 5xx is considered a server failure", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onResponseCallback = hookCallbacks.onResponse[0];

          const mockRequest = {
            method: "POST",
            routeOptions: { url: "/api/users" },
            url: "/api/users",
          } as Partial<FastifyRequest>;

          const mockReply = {
            elapsedTime: 15.3,
            statusCode: 400,
          } as Partial<FastifyReply>;

          onResponseCallback(mockRequest, mockReply, () => {});

          // success = statusCode < 500, so 400 is success: true
          expect(mockClient.trackRequest).toHaveBeenCalledWith({
            durationMs: 15.3,
            method: "POST",
            route: "/api/users",
            statusCode: 400,
            success: true,
            url: "/api/users",
          });
          done();
        });
      }));

    it("should track 5xx response with success=false", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onResponseCallback = hookCallbacks.onResponse[0];

          const mockRequest = {
            method: "DELETE",
            routeOptions: { url: "/api/resource/:id" },
            url: "/api/resource/123",
          } as Partial<FastifyRequest>;

          const mockReply = {
            elapsedTime: 100.5,
            statusCode: 500,
          } as Partial<FastifyReply>;

          onResponseCallback(mockRequest, mockReply, () => {});

          // success = statusCode < 500, so 500 is success: false
          expect(mockClient.trackRequest).toHaveBeenCalledWith({
            durationMs: 100.5,
            method: "DELETE",
            route: "/api/resource/:id",
            statusCode: 500,
            success: false,
            url: "/api/resource/123",
          });
          done();
        });
      }));

    it("should set success=false for 500 and success=true for 499 (boundary)", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onResponseCallback = hookCallbacks.onResponse[0];

          const makeRequest = (statusCode: number) => {
            onResponseCallback(
              {
                method: "GET",
                routeOptions: { url: "/test" },
                url: "/test",
              } as Partial<FastifyRequest>,
              { elapsedTime: 1, statusCode } as Partial<FastifyReply>,
              () => {},
            );
          };

          makeRequest(499);
          expect(mockClient.trackRequest).toHaveBeenLastCalledWith(
            expect.objectContaining({ statusCode: 499, success: true }),
          );

          makeRequest(500);
          expect(mockClient.trackRequest).toHaveBeenLastCalledWith(
            expect.objectContaining({ statusCode: 500, success: false }),
          );

          done();
        });
      }));

    it("should use raw URL as route fallback when no routeOptions.url", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onResponseCallback = hookCallbacks.onResponse[0];

          const mockRequest = {
            method: "GET",
            routeOptions: { url: undefined },
            url: "/unknown",
          } as Partial<FastifyRequest>;

          const mockReply = {
            elapsedTime: 5,
            statusCode: 404,
          } as Partial<FastifyReply>;

          onResponseCallback(mockRequest, mockReply, () => {});

          // route falls back to request.url when routeOptions.url is undefined
          // 404 < 500 so success: true
          expect(mockClient.trackRequest).toHaveBeenCalledWith({
            durationMs: 5,
            method: "GET",
            route: "/unknown",
            statusCode: 404,
            success: true,
            url: "/unknown",
          });
          done();
        });
      }));

    it("should mark 399 as success", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onResponseCallback = hookCallbacks.onResponse[0];

          const mockRequest = {
            method: "GET",
            routeOptions: { url: "/test" },
            url: "/test",
          } as Partial<FastifyRequest>;

          const mockReply = {
            elapsedTime: 10,
            statusCode: 399,
          } as Partial<FastifyReply>;

          onResponseCallback(mockRequest, mockReply, () => {});

          expect(mockClient.trackRequest).toHaveBeenCalledWith({
            durationMs: 10,
            method: "GET",
            route: "/test",
            statusCode: 399,
            success: true,
            url: "/test",
          });
          done();
        });
      }));
  });

  describe("onSend hook", () => {
    it("should track exception from a Problem Details response", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onSendCallback = hookCallbacks.onSend[0];

          const mockRequest = {
            method: "GET",
            routeOptions: { url: "/api/fauth" },
            url: "/api/fauth",
          } as Partial<FastifyRequest>;

          const mockReply = {
            getHeader: vi
              .fn()
              .mockReturnValue("application/problem+json; charset=utf-8"),
            statusCode: 401,
          } as Partial<FastifyReply>;

          const payload = JSON.stringify({
            detail: "Invalid issuer: https://evil.example.com",
            status: 401,
            title: "Unauthorized",
            type: "https://ioapp.it/problems/unauthorized",
          });

          let hookDoneCalled = false;
          onSendCallback(mockRequest, mockReply, payload, () => {
            hookDoneCalled = true;
          });

          expect(hookDoneCalled).toBe(true);
          expect(mockClient.trackException).toHaveBeenCalledWith(
            expect.objectContaining({
              method: "GET",
              route: "/api/fauth",
              url: "/api/fauth",
            }),
          );
          const trackedError = (
            mockClient.trackException as ReturnType<typeof vi.fn>
          ).mock.calls[0][0].error as Error;
          expect(trackedError.message).toBe(
            "Invalid issuer: https://evil.example.com",
          );
          expect(trackedError.name).toBe("Unauthorized");
          done();
        });
      }));

    it("should not track exception for non-problem+json content type", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onSendCallback = hookCallbacks.onSend[0];

          const mockRequest = {
            method: "GET",
            routeOptions: { url: "/api/users" },
            url: "/api/users",
          } as Partial<FastifyRequest>;

          const mockReply = {
            getHeader: vi.fn().mockReturnValue("application/json"),
            statusCode: 400,
          } as Partial<FastifyReply>;

          onSendCallback(
            mockRequest,
            mockReply,
            JSON.stringify({ error: "bad" }),
            () => {},
          );

          expect(mockClient.trackException).not.toHaveBeenCalled();
          done();
        });
      }));

    it("should not track exception for 2xx responses", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onSendCallback = hookCallbacks.onSend[0];

          const mockRequest = {
            method: "GET",
            routeOptions: { url: "/api/test" },
            url: "/api/test",
          } as Partial<FastifyRequest>;

          const mockReply = {
            getHeader: vi.fn().mockReturnValue("application/problem+json"),
            statusCode: 200,
          } as Partial<FastifyReply>;

          onSendCallback(
            mockRequest,
            mockReply,
            JSON.stringify({ detail: "ok" }),
            () => {},
          );

          expect(mockClient.trackException).not.toHaveBeenCalled();
          done();
        });
      }));

    it("should fall back to 'HTTP {status}' message when detail is absent", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onSendCallback = hookCallbacks.onSend[0];

          const mockRequest = {
            method: "POST",
            routeOptions: { url: "/api/data" },
            url: "/api/data",
          } as Partial<FastifyRequest>;

          const mockReply = {
            getHeader: vi.fn().mockReturnValue("application/problem+json"),
            statusCode: 500,
          } as Partial<FastifyReply>;

          onSendCallback(
            mockRequest,
            mockReply,
            JSON.stringify({ status: 500 }),
            () => {},
          );

          const trackedError = (
            mockClient.trackException as ReturnType<typeof vi.fn>
          ).mock.calls[0][0].error as Error;
          expect(trackedError.message).toBe("HTTP 500");
          expect(trackedError.name).toBe("ServerError");
          done();
        });
      }));
  });

  describe("onError hook", () => {
    it("should track exception on error", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onErrorCallback = hookCallbacks.onError[0];

          const error = new Error("Something went wrong");
          error.name = "ApplicationError";

          const mockRequest = {
            method: "POST",
            routeOptions: { url: "/api/create" },
            url: "/api/create",
          } as Partial<FastifyRequest>;

          let hookDoneCalled = false;
          const hookDone = () => {
            hookDoneCalled = true;
          };

          onErrorCallback(mockRequest, {} as FastifyReply, error, hookDone);

          expect(hookDoneCalled).toBe(true);
          expect(mockClient.trackException).toHaveBeenCalledWith({
            error,
            method: "POST",
            route: "/api/create",
            url: "/api/create",
          });
          done();
        });
      }));

    it("should use route pattern when available", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onErrorCallback = hookCallbacks.onError[0];

          const error = new Error("Not found");
          const mockRequest = {
            method: "GET",
            routeOptions: { url: "/api/users/:id" },
            url: "/api/users/999",
          } as Partial<FastifyRequest>;

          onErrorCallback(mockRequest, {} as FastifyReply, error, () => {});

          expect(mockClient.trackException).toHaveBeenCalledWith({
            error,
            method: "GET",
            route: "/api/users/:id",
            url: "/api/users/999",
          });
          done();
        });
      }));

    it("should fallback to raw URL when no route pattern", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onErrorCallback = hookCallbacks.onError[0];

          const error = new Error("Error");
          const mockRequest = {
            method: "GET",
            routeOptions: { url: undefined },
            url: "/unknown-route",
          } as Partial<FastifyRequest>;

          onErrorCallback(mockRequest, {} as FastifyReply, error, () => {});

          expect(mockClient.trackException).toHaveBeenCalledWith({
            error,
            method: "GET",
            route: "/unknown-route",
            url: "/unknown-route",
          });
          done();
        });
      }));

    it("should capture error details", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onErrorCallback = hookCallbacks.onError[0];

          const error = new TypeError("Cannot read property 'id' of null");
          const mockRequest = {
            method: "PATCH",
            routeOptions: { url: "/api/update/:id" },
            url: "/api/update/123",
          } as Partial<FastifyRequest>;

          onErrorCallback(mockRequest, {} as FastifyReply, error, () => {});

          expect(mockClient.trackException).toHaveBeenCalledWith({
            error,
            method: "PATCH",
            route: "/api/update/:id",
            url: "/api/update/123",
          });
          done();
        });
      }));
  });

  describe("HTTP methods", () => {
    it("should track various HTTP methods in requests", () =>
      new Promise<void>((done) => {
        plugin(mockApp as FastifyInstance, { client: mockClient }, () => {
          const onResponseCallback = hookCallbacks.onResponse[0];

          const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD"];

          methods.forEach((method) => {
            const mockRequest = {
              method,
              routeOptions: { url: "/api/test" },
              url: `/api/test`,
            } as Partial<FastifyRequest>;

            const mockReply = {
              elapsedTime: 10,
              statusCode: 200,
            } as Partial<FastifyReply>;

            onResponseCallback(mockRequest, mockReply, () => {});
          });

          expect(mockClient.trackRequest).toHaveBeenCalledTimes(methods.length);
          done();
        });
      }));
  });
});
