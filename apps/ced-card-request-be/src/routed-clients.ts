import type { Container, CosmosClient } from "@azure/cosmos";
import type {
  GestioneDomandaCedRepository,
  InpsCedConfig,
  InpsCedTelemetry,
} from "@pagopa/io-core-adapter-inps-ced";
import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import { createInpsCedClient } from "@pagopa/io-core-adapter-inps-ced";
import { emitCustomEvent } from "@pagopa/io-core-adapter-tracing";
import { isTestUser } from "@pagopa/io-core-domain/utilities";
import {
  createEnvRouter,
  type EnvRouter,
} from "@pagopa/io-core-environment-router";

import type { AppConfig } from "./config.js";

import { getRequestSession } from "./async-local-storage-session-context.js";

export interface InpsEnvironment {
  readonly config: InpsCedConfig;
  readonly defaultCodiceUfficio: string;
  readonly signedFetch: SignedFetch;
}

interface CosmosContainerConfig {
  readonly containerName: string;
  readonly databaseName: string;
}

const createIsTestRequest = (testUsers: readonly string[]) => (): boolean => {
  // Session is undefined only on public routes; authenticated routes get 401 from the session pre-handler first.
  const session = getRequestSession();
  return session !== undefined && isTestUser(testUsers, session.fiscalCode);
};

export const createDbRouter = (
  config: AppConfig,
  cosmosClient: CosmosClient,
  testUsers: readonly string[],
): EnvRouter<Container> => {
  const createContainer = (containerConfig: CosmosContainerConfig): Container =>
    cosmosClient
      .database(containerConfig.databaseName)
      .container(containerConfig.containerName);

  return createEnvRouter<CosmosContainerConfig, Container>({
    createProdInstance: createContainer,
    createTestInstance: createContainer,
    isTestRequest: createIsTestRequest(testUsers),
    onRoute: (env) =>
      emitCustomEvent("env-router.db.routed", {
        caller: "DbRouter",
        data: { env },
      })("DbRouter"),
    prodConfig: {
      containerName: config.COSMOS_CONTAINER_NAME,
      databaseName: config.COSMOS_DATABASE_NAME,
    },
    testConfig: {
      containerName: config.COSMOS_CONTAINER_NAME_TEST,
      databaseName: config.COSMOS_DATABASE_NAME,
    },
  });
};

export const createInpsRouter = (params: {
  prod: InpsEnvironment;
  telemetry?: InpsCedTelemetry;
  test: InpsEnvironment;
  testUsers: readonly string[];
}): EnvRouter<GestioneDomandaCedRepository> => {
  // The codiceUfficio falls back to the environment's ModI default when the
  // request has no session (e.g. background calls).
  const createClient = (
    environment: InpsEnvironment,
  ): GestioneDomandaCedRepository =>
    createInpsCedClient({
      config: environment.config,
      getIdentity: () => {
        const session = getRequestSession();
        return session
          ? {
              codiceUfficio: environment.defaultCodiceUfficio,
              userId: session.fiscalCode,
            }
          : undefined;
      },
      signedFetch: environment.signedFetch,
      telemetry: params.telemetry,
    });

  return createEnvRouter<InpsEnvironment, GestioneDomandaCedRepository>({
    createProdInstance: createClient,
    createTestInstance: createClient,
    isTestRequest: createIsTestRequest(params.testUsers),
    onRoute: (env) =>
      emitCustomEvent("env-router.inps.routed", {
        caller: "InpsRouter",
        data: { env },
      })("InpsRouter"),
    prodConfig: params.prod,
    testConfig: params.test,
  });
};
