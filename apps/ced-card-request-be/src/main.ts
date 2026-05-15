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
  host: config.REDIS_HOST,
  password: config.REDIS_PASSWORD,
  port: config.REDIS_PORT,
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
