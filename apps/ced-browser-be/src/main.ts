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

import { createRedisSessionRepository } from "./adapters/outbound/redis/redis-session.repository.js";
import { parseConfig } from "./config.js";

const config = parseConfig();

const redisClient = await createResilientRedisClient({
  endpoint: process.env.REDIS_ENDPOINT ?? "localhost:6379",
  entraId: process.env.AZURE_CLIENT_ID
    ? { clientId: process.env.AZURE_CLIENT_ID }
    : undefined,
  tls: config.REDIS_TLS,
});

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

mountFimsHandlers(app, fimsAuthFlow);

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
});

await app.listen({ host: config.HOST, port: config.PORT });
