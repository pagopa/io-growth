import { beforeEach, describe, expect, it, vi } from "vitest";

import { emitCustomEvent } from "../emit-custom-event.js";
import * as telemetryRegistry from "../telemetry-registry.js";

describe("emitCustomEvent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should emit custom event with provided caller context", () => {
    const mockTrackEvent = vi.fn();
    vi.spyOn(telemetryRegistry, "getTelemetryClient").mockReturnValue({
      trackEvent: mockTrackEvent,
      trackException: vi.fn(),
      trackRequest: vi.fn(),
    });

    const eventName = "user.action";
    const payload = { caller: "useCase", data: JSON.stringify({ id: 123 }) };
    const callerContext = "controller";

    emitCustomEvent(eventName, payload)(callerContext);

    expect(mockTrackEvent).toHaveBeenCalledWith({
      caller: callerContext,
      name: eventName,
      payload,
    });
  });

  it("should fallback to payload caller when no caller context provided", () => {
    const mockTrackEvent = vi.fn();
    vi.spyOn(telemetryRegistry, "getTelemetryClient").mockReturnValue({
      trackEvent: mockTrackEvent,
      trackException: vi.fn(),
      trackRequest: vi.fn(),
    });

    const eventName = "user.action";
    const payload = { caller: "useCase", data: JSON.stringify({ id: 123 }) };

    emitCustomEvent(eventName, payload)();

    expect(mockTrackEvent).toHaveBeenCalledWith({
      caller: "useCase",
      name: eventName,
      payload,
    });
  });

  it("should prefer caller context over payload caller", () => {
    const mockTrackEvent = vi.fn();
    vi.spyOn(telemetryRegistry, "getTelemetryClient").mockReturnValue({
      trackEvent: mockTrackEvent,
      trackException: vi.fn(),
      trackRequest: vi.fn(),
    });

    const eventName = "user.action";
    const payload = { caller: "useCase", data: JSON.stringify({ id: 123 }) };
    const callerContext = "handler";

    emitCustomEvent(eventName, payload)(callerContext);

    expect(mockTrackEvent).toHaveBeenCalledWith({
      caller: callerContext,
      name: eventName,
      payload,
    });
  });

  it("should handle complex data serialization", () => {
    const mockTrackEvent = vi.fn();
    vi.spyOn(telemetryRegistry, "getTelemetryClient").mockReturnValue({
      trackEvent: mockTrackEvent,
      trackException: vi.fn(),
      trackRequest: vi.fn(),
    });

    const eventName = "complex.event";
    const complexData = {
      action: "login",
      nested: { level: { deep: "value" } },
      timestamp: 1234567890,
      user: { id: 1, name: "John" },
    };
    const payload = {
      caller: "authService",
      data: JSON.stringify(complexData),
    };

    emitCustomEvent(eventName, payload)("auth");

    expect(mockTrackEvent).toHaveBeenCalledWith({
      caller: "auth",
      name: eventName,
      payload,
    });
  });

  it("should be a curried function", () => {
    const mockTrackEvent = vi.fn();
    vi.spyOn(telemetryRegistry, "getTelemetryClient").mockReturnValue({
      trackEvent: mockTrackEvent,
      trackException: vi.fn(),
      trackRequest: vi.fn(),
    });

    const eventName = "test.event";
    const payload = { caller: "test", data: "test" };

    const emitter = emitCustomEvent(eventName, payload);
    expect(typeof emitter).toBe("function");

    emitter("context1");
    expect(mockTrackEvent).toHaveBeenCalledTimes(1);

    emitter("context2");
    expect(mockTrackEvent).toHaveBeenCalledTimes(2);
  });

  it("should emit event with undefined caller context", () => {
    const mockTrackEvent = vi.fn();
    vi.spyOn(telemetryRegistry, "getTelemetryClient").mockReturnValue({
      trackEvent: mockTrackEvent,
      trackException: vi.fn(),
      trackRequest: vi.fn(),
    });

    const eventName = "test.event";
    const payload = { caller: "useCase", data: "data" };

    emitCustomEvent(eventName, payload)(undefined);

    expect(mockTrackEvent).toHaveBeenCalledWith({
      caller: "useCase",
      name: eventName,
      payload,
    });
  });
});
