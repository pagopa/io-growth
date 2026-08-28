import type { ArClient, ArClientConfig } from "@pagopa/io-core-adapter-ar";
import type {
  TypedDbClient,
  TypedDbClientConfig,
} from "@pagopa/io-core-adapter-drizzle";

import { createArClient } from "@pagopa/io-core-adapter-ar";
import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import {
  createEnvRouter,
  type EnvRouter,
} from "@pagopa/io-core-environment-router";

import type { AppConfig } from "./config.js";

import { injectDbAuditContext } from "./adapters/outbound/drizzle/drizzle-audit-context.js";
import * as schema from "./adapters/outbound/drizzle/schema/index.js";
import { getRequestSession } from "./async-local-storage-session-context.js";

/**
 * Routing predicate shared by every environment router.
 * It reads the current request session from AsyncLocalStorage so the routing
 * decision automatically follows the authenticated user without any explicit
 * argument passing.
 */
const isTestRequest = (): boolean => {
  const userType = getRequestSession()?.userType;
  return userType === "test_admin" || userType === "test_operator";
};

export const createDbRouter = (
  config: AppConfig,
): EnvRouter<TypedDbClient<typeof schema>> => {
  const sharedConfig: Omit<TypedDbClientConfig<typeof schema>, "database"> = {
    host: config.POSTGRES_HOST,
    max: config.POSTGRES_MAX_CONNECTIONS,
    onNotice: (notice) => {
      emitCustomEvent("database.notice", {
        caller: "DrizzleClient",
        data: { message: notice.message },
      })("DrizzleClient");
    },
    onTransaction: injectDbAuditContext,
    password: config.POSTGRES_PASSWORD,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    user: config.POSTGRES_USER,
  };

  const router = createEnvRouter<
    TypedDbClientConfig<typeof schema>,
    TypedDbClient<typeof schema>
  >({
    createProdInstance: (dbConfig) => createTypedDbClient(dbConfig, schema),
    createTestInstance: (dbConfig) => createTypedDbClient(dbConfig, schema),
    isTestRequest,
    onRoute: (env) =>
      emitCustomEvent("env-router.db.routed", {
        caller: "DbRouter",
        data: { env },
      })("DbRouter"),
    prodConfig: { ...sharedConfig, database: config.POSTGRES_DB },
    // Fall back to the prod database when no dedicated test database is set.
    testConfig: {
      ...sharedConfig,
      database: config.POSTGRES_DB_TEST ?? config.POSTGRES_DB,
    },
  });

  return router;
};

export const createArRouter = (config: AppConfig): EnvRouter<ArClient> => {
  const prodConfig: ArClientConfig = {
    baseUrl: config.AR_ENDPOINT,
    subscriptionKey: config.AR_API_KEY,
  };

  const testConfig: ArClientConfig = {
    baseUrl: config.AR_ENDPOINT_TEST,
    subscriptionKey: config.AR_API_KEY_TEST,
  };

  const router = createEnvRouter<typeof prodConfig, ArClient>({
    createProdInstance: createArClient,
    createTestInstance: createArClient,
    isTestRequest,
    onRoute: (env) =>
      emitCustomEvent("env-router.ar.routed", {
        caller: "ArClientRouter",
        data: { env },
      })("ArClientRouter"),
    prodConfig,
    testConfig,
  });

  return router;
};
