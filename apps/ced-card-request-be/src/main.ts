// Side-effect import: must stay FIRST so tracing instrumentation is installed
// before any instrumented library (Fastify, PostgreSQL, Redis, fetch) loads.
import "./telemetry.js";

import { CosmosClient } from "@azure/cosmos";
import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
} from "@pagopa/io-core-adapter-fastify";
import {
  buildFimsConfig,
  createBlobAuditLogger,
  createFimsAuthFlow,
  createLollipopVerifier,
  createOidcClient,
  mountFimsHandlers,
} from "@pagopa/io-core-adapter-fims";
import {
  buildInpsCedConfig,
  createGestioneDomandaCedClient,
  initInpsCedClient,
} from "@pagopa/io-core-adapter-inps-ced";
import {
  buildModiConfig,
  createKeyvaultCredentialProvider,
  createSignedFetch,
} from "@pagopa/io-core-adapter-modi";
import { createResilientRedisClient } from "@pagopa/io-core-adapter-redis";
import {
  getTelemetryClient,
  tracingPlugin,
} from "@pagopa/io-core-adapter-tracing";
import Fastify from "fastify";

import { CardRequestSessionSchema } from "./adapters/inbound/fastify/auth/session.js";
import {
  mountConfirmApplicationHandler,
  mountCreateDraftHandler,
  mountGetApplicationStatusHandler,
  mountInfoReadinessHandler,
  mountInfoStartupHandler,
  mountUploadPhotoHandler,
} from "./adapters/inbound/fastify/index.js";
import { createCosmosHealthCheckRepository } from "./adapters/outbound/cosmos/cosmos-health-check.repository.js";
import { createCosmosSupportRecordRepository } from "./adapters/outbound/cosmos/cosmos-support-record.repository.js";
import { createRedisHealthCheckRepository } from "./adapters/outbound/redis/redis-health-check.repository.js";
import { createRedisSessionRepository } from "./adapters/outbound/redis/redis-session.repository.js";
import { makeConfirmApplicationUseCase } from "./application/use-cases/confirm/confirm-application.use-case.js";
import { makeGetInfoReadinessUseCase } from "./application/use-cases/health/info-readiness.use-case.js";
import { makeGetInfoStartupUseCase } from "./application/use-cases/health/info-startup.use-case.js";
import { makeUploadPhotoUseCase } from "./application/use-cases/image/upload-photo.use-case.js";
import { makeCreateDraftUseCase } from "./application/use-cases/request/create-draft.use-case.js";
import { makeCheckRequestUseCase } from "./application/use-cases/status/check-request.use-case.js";
import {
  createSessionContextPreHandler,
  getRequestSession,
} from "./async-local-storage-session-context.js";
import { parseConfig } from "./config.js";

const config = parseConfig();

// The Cosmos DB Emulator (local dev) only supports key-based auth and serves
// a self-signed certificate; every real environment omits COSMOS_KEY and
// authenticates via DefaultAzureCredential over a properly signed endpoint.
// Endpoint discovery is also disabled for the emulator: it advertises its
// read/write region as https://127.0.0.1:8081 regardless of the endpoint used
// to reach it, which fails when the app runs in a different container.
const cosmosClient = config.COSMOS_KEY
  ? new CosmosClient({
      connectionPolicy: { enableEndpointDiscovery: false },
      endpoint: config.COSMOS_ENDPOINT,
      key: config.COSMOS_KEY,
    })
  : new CosmosClient({
      aadCredentials: new DefaultAzureCredential(),
      endpoint: config.COSMOS_ENDPOINT,
    });

const redisClient = await createResilientRedisClient({
  endpoint: config.REDIS_ENDPOINT,
  entraId: config.AZURE_CLIENT_ID
    ? { clientId: config.AZURE_CLIENT_ID }
    : undefined,
  tls: config.REDIS_TLS,
});

const redisHealthCheckRepository =
  createRedisHealthCheckRepository(redisClient);
const cosmosHealthCheckRepository =
  createCosmosHealthCheckRepository(cosmosClient);
const sessionStore = createRedisSessionRepository(redisClient);

const supportRecordContainer = cosmosClient
  .database(config.COSMOS_DATABASE_NAME)
  .container(config.COSMOS_CONTAINER_NAME);
const supportRecordRepository = createCosmosSupportRecordRepository(
  supportRecordContainer,
);

const containerClient = (
  config.AZURE_STORAGE_CONNECTION_STRING
    ? BlobServiceClient.fromConnectionString(
        config.AZURE_STORAGE_CONNECTION_STRING,
      )
    : new BlobServiceClient(
        config.FIMS_AUDIT_BLOB_URI,
        new DefaultAzureCredential(),
      )
).getContainerClient(config.FIMS_AUDIT_CONTAINER);
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

// INPS CED integration over ModI (profile selected via MODI_PROFILE env).
const modiConfig = buildModiConfig(config.modi);
const inpsCedConfig = buildInpsCedConfig(config);
const modiCredentialProvider =
  await createKeyvaultCredentialProvider(modiConfig);
const inpsSignedFetch = createSignedFetch({
  audience: inpsCedConfig.audience,
  config: modiConfig,
  credentialProvider: modiCredentialProvider,
});
// Per-request INPS identity is resolved from the session held in ALS. The
// codiceUfficio falls back to the ModI default when the request has no session
// (e.g. background calls), matching the signed-fetch fallback behaviour.
initInpsCedClient(
  inpsCedConfig,
  inpsSignedFetch,
  () => {
    const session = getRequestSession();
    return session
      ? {
          codiceUfficio: modiConfig.defaultCodiceUfficio,
          userId: session.fiscalCode,
        }
      : undefined;
  },
  getTelemetryClient(),
);
const gestioneDomandaCedRepository = createGestioneDomandaCedClient();

const app = Fastify({ logger: true });

await app.register(tracingPlugin);

// Inbound adapters — public routes
mountInfoStartupHandler(app, makeGetInfoStartupUseCase);
mountInfoReadinessHandler(
  app,
  makeGetInfoReadinessUseCase({
    persistenceHealthCheckRepository: cosmosHealthCheckRepository,
    sessionStoreHealthCheckRepository: redisHealthCheckRepository,
  }),
);

mountFimsHandlers(app, fimsAuthFlow);

// Authenticated routes scope
const authPreHandler = createAuthenticationPreHandler(sessionStore.getSession);

app.register(async (authenticatedApp) => {
  authenticatedApp.addHook("preHandler", authPreHandler);

  // Populate the per-request session in ALS so outbound INPS calls can thread
  // the citizen identity (fiscal code) into the ModI signed request.
  authenticatedApp.addHook(
    "preHandler",
    createSessionContextPreHandler((req) =>
      getSessionFromRequest(req, CardRequestSessionSchema),
    ),
  );

  mountGetApplicationStatusHandler(
    authenticatedApp,
    makeCheckRequestUseCase(gestioneDomandaCedRepository),
  );

  mountCreateDraftHandler(
    authenticatedApp,
    makeCreateDraftUseCase(
      supportRecordRepository,
      gestioneDomandaCedRepository,
    ),
  );

  mountUploadPhotoHandler(
    authenticatedApp,
    makeUploadPhotoUseCase(
      supportRecordRepository,
      gestioneDomandaCedRepository,
    ),
  );

  mountConfirmApplicationHandler(
    authenticatedApp,
    makeConfirmApplicationUseCase(
      supportRecordRepository,
      gestioneDomandaCedRepository,
    ),
  );
});

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
});

await app.listen({ host: config.HOST, port: config.PORT });
