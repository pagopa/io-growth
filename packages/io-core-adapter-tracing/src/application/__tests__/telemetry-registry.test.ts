import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AzureTracingConfig } from "../../config.js";

// The registry holds a process-wide singleton (`activeClient`). We use
// vi.resetModules() before each test so every dynamic import gets a fresh
// module instance, guaranteeing isolation between tests.

describe("Telemetry Registry", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe("getTelemetryClient", () => {
    it("should return a noop client by default before initialization", async () => {
      const { getTelemetryClient } = await import("../telemetry-registry.js");
      const client = getTelemetryClient();

      expect(client).toBeDefined();
      expect(client.trackEvent).toBeDefined();
      expect(client.trackException).toBeDefined();
      expect(client.trackRequest).toBeDefined();
    });

    it("should not throw when calling noop client methods", async () => {
      const { getTelemetryClient } = await import("../telemetry-registry.js");
      const client = getTelemetryClient();

      expect(() => {
        client.trackEvent({
          name: "test",
          payload: { caller: "test", data: "test" },
        });
        client.trackException({
          error: new Error("test"),
          method: "GET",
          route: "/test",
          url: "/test",
        });
        client.trackRequest({
          durationMs: 100,
          method: "GET",
          route: "/test",
          statusCode: 200,
          success: true,
          url: "/test",
        });
      }).not.toThrow();
    });
  });

  describe("initTelemetry", () => {
    it("should return a client and register it as the active client", async () => {
      const { getTelemetryClient, initTelemetry } =
        await import("../telemetry-registry.js");

      const config: AzureTracingConfig = {
        connectionString: undefined,
        entraIdAuthEnabled: false,
        samplingRatio: 0.05,
      };

      const returned = initTelemetry(config);

      expect(returned).toBeDefined();
      // getTelemetryClient() must return exactly the same object
      expect(getTelemetryClient()).toBe(returned);
    });

    it("should select the console client when connectionString is undefined", async () => {
      // Import both modules after the reset so they share the same module cache
      const { getTelemetryClient, initTelemetry } =
        await import("../telemetry-registry.js");
      const { consoleTelemetryClient } =
        await import("../../adapters/outbound/console/console-telemetry.client.js");

      const config: AzureTracingConfig = {
        connectionString: undefined,
        entraIdAuthEnabled: false,
        samplingRatio: 0.1,
      };

      initTelemetry(config);

      // Must be the exact consoleTelemetryClient singleton, not the noop
      expect(getTelemetryClient()).toBe(consoleTelemetryClient);
    });

    it("should replace the active client on subsequent calls", async () => {
      const { getTelemetryClient, initTelemetry } =
        await import("../telemetry-registry.js");

      const config: AzureTracingConfig = {
        connectionString: undefined,
        entraIdAuthEnabled: false,
        samplingRatio: 0.05,
      };

      const first = initTelemetry(config);
      expect(getTelemetryClient()).toBe(first);

      const second = initTelemetry(config);
      expect(getTelemetryClient()).toBe(second);
    });
  });
});
