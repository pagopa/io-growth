import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";

export const executeWithTracing = async <O>(
  func: () => Promise<O>,
  caller: string,
  environment: string,
) => {
  const startTime = Date.now();

  emitCustomEvent("use-case.tracing.start", {
    caller,
    data: {
      message: `${environment} - Execution started at ${new Date(startTime).toISOString()}`,
    },
  })(caller);

  const result = await func();

  emitCustomEvent("use-case.tracing.end", {
    caller,
    data: {
      duration: `${Date.now() - startTime}ms`,
      message: `${environment} - Execution completed at ${new Date().toISOString()}`,
    },
  })(caller);

  return result;
};
