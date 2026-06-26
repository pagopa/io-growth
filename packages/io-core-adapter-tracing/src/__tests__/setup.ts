import { vi } from "vitest";

// Prevent the real @azure/monitor-opentelemetry SDK from initialising during
// unit tests. The SDK performs network I/O and registers process-wide OTel
// hooks on import, which causes 5 000 ms timeouts in CI. vi.mock() is hoisted
// by vitest and survives vi.resetModules() calls, so every test module that
// imports azure-tracing.client.ts gets this stub automatically.
vi.mock("@pagopa/azure-tracing/azure-monitor", () => ({
  initAzureMonitor: vi.fn(),
}));
