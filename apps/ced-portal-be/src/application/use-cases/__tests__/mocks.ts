import { vi } from "vitest";

import type { TracingRepository } from "../../../domain/ports/outbound/tracing.repository.js";

export const createMockTracingRepository = (
  overrides: Partial<TracingRepository> = {},
): TracingRepository => ({
  emitEvent: overrides.emitEvent ?? vi.fn(),
  // Pass-through so use cases still run the wrapped function.
  traceExecution:
    overrides.traceExecution ??
    (vi.fn((func: () => Promise<unknown>) =>
      func(),
    ) as unknown as TracingRepository["traceExecution"]),
});
