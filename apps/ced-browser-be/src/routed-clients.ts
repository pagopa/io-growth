import type {
  TypedDbClient,
  TypedDbClientConfig,
} from "@pagopa/io-core-adapter-drizzle";

import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { isTestUser } from "@pagopa/io-core-domain/utilities";
import {
  createEnvRouter,
  type EnvRouter,
} from "@pagopa/io-core-environment-router";

import type { AppConfig } from "./config.js";

import * as schema from "./adapters/outbound/drizzle/schema/index.js";
import { getRequestSession } from "./async-local-storage-session-context.js";

export const createDbRouter = (
  config: AppConfig,
  testUsers: readonly string[],
): EnvRouter<TypedDbClient<typeof schema>> => {
  const sharedConfig: Omit<TypedDbClientConfig<typeof schema>, "database"> = {
    host: config.POSTGRES_HOST,
    password: config.POSTGRES_PASSWORD,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    user: config.POSTGRES_USER,
  };

  return createEnvRouter<
    TypedDbClientConfig<typeof schema>,
    TypedDbClient<typeof schema>
  >({
    createProdInstance: (dbConfig) => createTypedDbClient(dbConfig, schema),
    createTestInstance: (dbConfig) => createTypedDbClient(dbConfig, schema),
    // Session is undefined only on public routes; authenticated routes get 401 from the session pre-handler first.
    isTestRequest: () => {
      const session = getRequestSession();
      return session !== undefined && isTestUser(testUsers, session.fiscalCode);
    },
    onRoute: (env) =>
      emitCustomEvent("env-router.db.routed", {
        caller: "DbRouter",
        data: { env },
      })("DbRouter"),
    prodConfig: { ...sharedConfig, database: config.POSTGRES_DB },
    // Falls back to the prod database when no dedicated test database is set.
    testConfig: {
      ...sharedConfig,
      database: config.POSTGRES_DB_TEST ?? config.POSTGRES_DB,
    },
  });
};
