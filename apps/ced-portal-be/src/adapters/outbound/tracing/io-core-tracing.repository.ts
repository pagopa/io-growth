import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";

import type { TracingRepository } from "../../../domain/ports/outbound/tracing.repository.js";

export const createIoCoreTracingRepository = (): TracingRepository => {
  const emitEvent: TracingRepository["emitEvent"] = (name, payload) => {
    emitCustomEvent(name, payload)(payload.caller);
  };

  return {
    emitEvent,
    traceExecution: async (func, caller, environment) => {
      const startTime = Date.now();

      emitEvent("use-case.tracing.start", {
        caller,
        data: {
          message: `${environment} - Execution started at ${new Date(startTime).toISOString()}`,
        },
      });

      const result = await func();

      emitEvent("use-case.tracing.end", {
        caller,
        data: {
          duration: `${Date.now() - startTime}ms`,
          message: `${environment} - Execution completed at ${new Date().toISOString()}`,
        },
      });

      return result;
    },
  };
};
