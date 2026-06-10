import { beforeEach, describe, expect, it, vi } from "vitest";

import type {
  CustomEvent,
  ExceptionTelemetry,
  RequestTelemetry,
} from "../../../../domain/entities.js";

import { consoleTelemetryClient } from "../console-telemetry.client.js";

// eslint-disable-next-line max-lines-per-function
describe("Console Telemetry Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("trackEvent", () => {
    it("should log custom event to console", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const event: CustomEvent = {
        caller: "controller",
        name: "user.login",
        payload: { caller: "authService", data: JSON.stringify({ userId: 1 }) },
      };

      consoleTelemetryClient.trackEvent(event);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0];
      expect(callArgs.join("")).toContain("event");
      expect(callArgs.join("")).toContain("user.login");
      expect(callArgs.join("")).toContain("controller");
    });

    it("should use payload caller when event caller is undefined", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const event: CustomEvent = {
        name: "test.event",
        payload: { caller: "service", data: "data" },
      };

      consoleTelemetryClient.trackEvent(event);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0];
      expect(callArgs.join("")).toContain("service");
    });

    it("should include event name and data in log", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const eventData = { action: "delete", resourceId: "123" };
      const event: CustomEvent = {
        name: "resource.deleted",
        payload: {
          caller: "handler",
          data: JSON.stringify(eventData),
        },
      };

      consoleTelemetryClient.trackEvent(event);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("resource.deleted");
      expect(callArgs).toContain(JSON.stringify(eventData));
    });
  });

  describe("trackException", () => {
    it("should log exception to console.error", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const error = new Error("Database connection failed");
      error.name = "DatabaseError";
      const exception: ExceptionTelemetry = {
        error,
        method: "POST",
        route: "/api/users",
        url: "/api/users",
      };

      consoleTelemetryClient.trackException(exception);

      expect(errorSpy).toHaveBeenCalledTimes(2);
      const callArgs = errorSpy.mock.calls[0].join("");
      expect(callArgs).toContain("POST");
      expect(callArgs).toContain("/api/users");
      expect(callArgs).toContain("DatabaseError");
      expect(callArgs).toContain("Database connection failed");
    });

    it("should include stack trace when available", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const error = new Error("Test error");
      const exception: ExceptionTelemetry = {
        error,
        method: "GET",
        route: "/test",
        url: "/test",
      };

      consoleTelemetryClient.trackException(exception);

      expect(errorSpy).toHaveBeenCalledTimes(2);
      // Stack trace should be logged in a separate call
      const allCalls = errorSpy.mock.calls.flatMap((call) => call.join(""));
      expect(allCalls.join("")).toContain("Error:");
    });

    it("should handle exceptions without stack trace", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const error = new Error("No stack");
      error.stack = undefined;
      const exception: ExceptionTelemetry = {
        error,
        method: "DELETE",
        route: "/api/resource/:id",
        url: "/api/resource/123",
      };

      expect(() => {
        consoleTelemetryClient.trackException(exception);
      }).not.toThrow();

      expect(errorSpy).toHaveBeenCalledTimes(1);
    });

    it("should include method and URL in exception log", () => {
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      const error = new Error("Test");
      const exception: ExceptionTelemetry = {
        error,
        method: "PUT",
        route: "/api/endpoint",
        url: "/api/endpoint",
      };

      consoleTelemetryClient.trackException(exception);

      expect(errorSpy).toHaveBeenCalledTimes(2);
      const callString = errorSpy.mock.calls[0].join("");
      expect(callString).toContain("PUT");
      expect(callString).toContain("/api/endpoint");
    });
  });

  describe("trackRequest", () => {
    it("should log successful request (2xx status) with green color", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const request: RequestTelemetry = {
        durationMs: 42.5,
        method: "GET",
        route: "/api/users/:id",
        statusCode: 200,
        success: true,
        url: "/api/users/123",
      };

      consoleTelemetryClient.trackRequest(request);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("GET");
      expect(callArgs).toContain("/api/users/123");
      expect(callArgs).toContain("200");
      // 2xx uses green ANSI color
      expect(callArgs).toContain("\x1b[32m");
      expect(callArgs).toContain("43ms"); // Math.round(42.5)
    });

    it("should log client error request (4xx status) with yellow color", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const request: RequestTelemetry = {
        durationMs: 15.3,
        method: "POST",
        route: "/api/users",
        statusCode: 400,
        success: false,
        url: "/api/users",
      };

      consoleTelemetryClient.trackRequest(request);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("POST");
      expect(callArgs).toContain("400");
      // 4xx uses yellow ANSI color
      expect(callArgs).toContain("\x1b[33m");
    });

    it("should log server error request (5xx status) with red color", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const request: RequestTelemetry = {
        durationMs: 100.5,
        method: "DELETE",
        route: "/api/resource/:id",
        statusCode: 500,
        success: false,
        url: "/api/resource/123",
      };

      consoleTelemetryClient.trackRequest(request);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("DELETE");
      expect(callArgs).toContain("500");
      // 5xx uses red ANSI color
      expect(callArgs).toContain("\x1b[31m");
      expect(callArgs).toContain("101ms"); // Math.round(100.5)
    });

    it("should include route pattern in log", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const request: RequestTelemetry = {
        durationMs: 23.7,
        method: "PATCH",
        route: "/api/users/:id/profile",
        statusCode: 204,
        success: true,
        url: "/api/users/42/profile",
      };

      consoleTelemetryClient.trackRequest(request);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("/api/users/:id/profile");
    });

    it("should round duration to nearest millisecond", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const request: RequestTelemetry = {
        durationMs: 42.7,
        method: "GET",
        route: "/test",
        statusCode: 200,
        success: true,
        url: "/test",
      };

      consoleTelemetryClient.trackRequest(request);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("43ms");
    });

    it("should handle very fast requests (rounds to 0ms)", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const request: RequestTelemetry = {
        durationMs: 0.4,
        method: "HEAD",
        route: "/health",
        statusCode: 200,
        success: true,
        url: "/health",
      };

      consoleTelemetryClient.trackRequest(request);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("0ms"); // Math.round(0.4)
    });

    it("should handle slow requests", () => {
      const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      const request: RequestTelemetry = {
        durationMs: 5000.2,
        method: "POST",
        route: "/api/process",
        statusCode: 202,
        success: true,
        url: "/api/process",
      };

      consoleTelemetryClient.trackRequest(request);

      expect(logSpy).toHaveBeenCalledTimes(1);
      const callArgs = logSpy.mock.calls[0].join("");
      expect(callArgs).toContain("5000ms");
    });
  });
});
