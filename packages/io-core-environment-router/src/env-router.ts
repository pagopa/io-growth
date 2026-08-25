/**
 * Generic, framework-agnostic environment router.
 *
 * It wraps two singleton instances of an arbitrary client — one for the "prod"
 * environment and one for the "test" environment — and exposes a single
 * {@link EnvRouter.getInstance} accessor that transparently forwards every
 * interaction to the instance selected by the injected routing function.
 *
 * The routing decision is re-evaluated lazily on every property access, so the
 * router can be created once at composition-root time and still resolve the
 * correct instance per request based on in-memory context (e.g. an
 * `AsyncLocalStorage` holding the current session).
 *
 * Everything is injected by the consumer: configuration objects, their type,
 * the instantiation functions, the instance type and the routing predicate.
 * The router never reads environment variables nor knows anything about the
 * wrapped client.
 */

export interface EnvRouter<TInstance extends object> {
  /**
   * Returns a stable proxy that forwards every interaction to the prod or test
   * instance, re-evaluating {@link EnvRouterParams.isTestRequest} on each
   * property access. Inject the result into the hexagonal-architecture
   * dependencies in place of the raw client.
   */
  readonly getInstance: () => TInstance;
  /**
   * The managed singletons in `[prod, test]` order. Exposed for lifecycle
   * concerns only (e.g. closing connections on shutdown).
   */
  readonly instances: readonly TInstance[];
}

export type EnvRouterEnv = "prod" | "test";

export interface EnvRouterParams<TConfig, TInstance extends object> {
  /** Builds the prod instance from {@link EnvRouterParams.prodConfig}. */
  readonly createProdInstance: (config: TConfig) => TInstance;
  /** Builds the test instance from {@link EnvRouterParams.testConfig}. */
  readonly createTestInstance: (config: TConfig) => TInstance;
  /**
   * Lazy predicate evaluated on every access. Returns `true` when the request
   * must be routed to the test instance, `false` to use the prod instance.
   */
  readonly isTestRequest: () => boolean;
  /**
   * Optional callback invoked on every proxy property access with the current
   * environment (including the very first access). Use this to emit a custom
   * telemetry event without coupling the router to any specific tracing library.
   *
   * @example
   * ```ts
   * onRoute: (env) =>
   *   emitCustomEvent("env-router.routed", { caller: "DbRouter", data: { env } })(
   *     "DbRouter",
   *   ),
   * ```
   */
  readonly onRoute?: (env: EnvRouterEnv) => void;
  /** Configuration used to build the prod instance. */
  readonly prodConfig: TConfig;
  /** Configuration used to build the test instance. */
  readonly testConfig: TConfig;
}

export const createEnvRouter = <TConfig, TInstance extends object>(
  params: EnvRouterParams<TConfig, TInstance>,
): EnvRouter<TInstance> => {
  const prodInstance = params.createProdInstance(params.prodConfig);
  const testInstance = params.createTestInstance(params.testConfig);

  // A single proxy resolves the active instance on every property access and
  // binds methods to it, so callers can capture `getInstance()` once and still
  // be routed per request.
  //
  // `onRoute` is called on EVERY property access
  const proxy = new Proxy(prodInstance, {
    get(_target, property) {
      const isTest = params.isTestRequest();
      const active = isTest ? testInstance : prodInstance;

      params.onRoute?.(isTest ? "test" : "prod");

      const value = Reflect.get(active, property, active);
      return typeof value === "function"
        ? (value as (...args: unknown[]) => unknown).bind(active)
        : value;
    },
  });

  return {
    getInstance: () => proxy,
    instances: [prodInstance, testInstance],
  };
};
