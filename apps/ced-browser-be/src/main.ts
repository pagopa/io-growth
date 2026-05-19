import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import {
  buildFimsConfig,
  createBlobAuditLogger,
  createFimsAuthFlow,
  createLollipopVerifier,
  createOidcClient,
  mountFimsHandlers,
} from "@pagopa/io-core-adapter-fims";
import { createResilientRedisClient } from "@pagopa/io-core-adapter-redis";
import Fastify from "fastify";

import {
  mountInfoReadinessHandler,
  mountInfoStartupHandler,
} from "./adapters/inbound/fastify/index.js";
import { createRedisHealthCheckRepository } from "./adapters/outbound/redis/redis-health-check.repository.js";
import { createRedisSessionRepository } from "./adapters/outbound/redis/redis-session.repository.js";
import { makeGetInfoReadinessUseCase } from "./application/use-cases/health/info-readiness.use-case.js";
import { makeGetInfoStartupUseCase } from "./application/use-cases/health/info-startup.use-case.js";
import { parseConfig } from "./config.js";

const config = parseConfig();

const redisClient = await createResilientRedisClient({
  endpoint: config.REDIS_ENDPOINT ?? "localhost:6379",
  entraId: config.AZURE_CLIENT_ID
    ? { clientId: config.AZURE_CLIENT_ID }
    : undefined,
  tls: config.REDIS_TLS,
});

const redisHealthCheckRepository =
  createRedisHealthCheckRepository(redisClient);
const sessionStore = createRedisSessionRepository(redisClient);

const containerClient = new BlobServiceClient(
  config.FIMS_AUDIT_BLOB_URI,
  new DefaultAzureCredential(),
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

const app = Fastify({ logger: true });

// Inbound adapters — public routes
mountInfoStartupHandler(app, makeGetInfoStartupUseCase);
mountInfoReadinessHandler(
  app,
  makeGetInfoReadinessUseCase({
    sessionStoreHealthCheckRepository: redisHealthCheckRepository,
  }),
);

mountFimsHandlers(app, fimsAuthFlow);

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
});

await app.listen({ host: config.HOST, port: config.PORT });
