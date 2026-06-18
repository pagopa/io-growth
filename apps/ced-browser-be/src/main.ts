// Side-effect import: must stay FIRST so tracing instrumentation is installed
// before any instrumented library (Fastify, PostgreSQL, Redis, fetch) loads.
import "./telemetry.js";

import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import { createAuthenticationPreHandler } from "@pagopa/io-core-adapter-fastify";
import {
  buildFimsConfig,
  createBlobAuditLogger,
  createFimsAuthFlow,
  createLollipopVerifier,
  createOidcClient,
  mountFimsHandlers,
} from "@pagopa/io-core-adapter-fims";
import { createResilientRedisClient } from "@pagopa/io-core-adapter-redis";
import { tracingPlugin } from "@pagopa/io-core-adapter-tracing";
import Fastify from "fastify";

import {
  mountGetPlaceDetailHandler,
  mountInfoReadinessHandler,
  mountInfoStartupHandler,
  mountSearchPlacesHandler,
} from "./adapters/inbound/fastify/index.js";
import { createDrizzlePlaceRepository } from "./adapters/outbound/drizzle/drizzle-place.repository.js";
import * as schema from "./adapters/outbound/drizzle/schema/index.js";
import { createRedisHealthCheckRepository } from "./adapters/outbound/redis/redis-health-check.repository.js";
import { createRedisSessionRepository } from "./adapters/outbound/redis/redis-session.repository.js";
import { makeGetInfoReadinessUseCase } from "./application/use-cases/health/info-readiness.use-case.js";
import { makeGetInfoStartupUseCase } from "./application/use-cases/health/info-startup.use-case.js";
import { makeGetPlaceDetailUseCase } from "./application/use-cases/places/get-place-detail.use-case.js";
import { makeSearchPlacesUseCase } from "./application/use-cases/places/search-places.use-case.js";
import { parseConfig } from "./config.js";

const config = parseConfig();

const dbClient = createTypedDbClient(
  {
    database: config.POSTGRES_DB,
    host: config.POSTGRES_HOST,
    password: config.POSTGRES_PASSWORD,
    port: config.POSTGRES_PORT,
    ssl: config.POSTGRES_SSL,
    user: config.POSTGRES_USER,
  },
  schema,
);

const redisClient = await createResilientRedisClient({
  endpoint: config.REDIS_ENDPOINT,
  entraId: config.AZURE_CLIENT_ID
    ? { clientId: config.AZURE_CLIENT_ID }
    : undefined,
  tls: config.REDIS_TLS,
});

const redisHealthCheckRepository =
  createRedisHealthCheckRepository(redisClient);
const sessionStore = createRedisSessionRepository(redisClient);
const placeRepository = createDrizzlePlaceRepository(dbClient);

const blobServiceClient = config.AZURE_STORAGE_CONNECTION_STRING
  ? BlobServiceClient.fromConnectionString(
      config.AZURE_STORAGE_CONNECTION_STRING,
    )
  : new BlobServiceClient(
      config.FIMS_AUDIT_BLOB_URI,
      new DefaultAzureCredential(),
    );
const containerClient = blobServiceClient.getContainerClient(
  config.FIMS_AUDIT_CONTAINER,
);
const auditLogger = createBlobAuditLogger(containerClient);

const { fimsFlowConfig, oidcConfig } = buildFimsConfig(config);
const oidcClient = createOidcClient(oidcConfig);
const lollipopVerifier = createLollipopVerifier();
const fimsAuthFlow = createFimsAuthFlow(
  oidcClient,
  sessionStore,
  auditLogger,
  lollipopVerifier,
  fimsFlowConfig,
);

const app = Fastify({ logger: true });

await app.register(tracingPlugin);

// Inbound adapters — public routes
mountInfoStartupHandler(app, makeGetInfoStartupUseCase);
mountInfoReadinessHandler(
  app,
  makeGetInfoReadinessUseCase({
    sessionStoreHealthCheckRepository: redisHealthCheckRepository,
  }),
);

mountFimsHandlers(app, fimsAuthFlow);

// Authenticated citizen routes scope
const citizenAuthPreHandler = createAuthenticationPreHandler(
  sessionStore.getSession,
);
app.register(async (citizenApp) => {
  citizenApp.addHook("preHandler", citizenAuthPreHandler);
  mountSearchPlacesHandler(
    citizenApp,
    makeSearchPlacesUseCase(placeRepository),
  );
  mountGetPlaceDetailHandler(
    citizenApp,
    makeGetPlaceDetailUseCase(placeRepository),
  );
});

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
  await dbClient.closeConnection();
});

await app.listen({ host: config.HOST, port: config.PORT });
