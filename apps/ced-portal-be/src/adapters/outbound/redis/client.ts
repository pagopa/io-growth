import type { RedisClientConfig } from "@pagopa/io-core-adapter-redis";

import { createResilientRedisClient } from "@pagopa/io-core-adapter-redis";

const config: RedisClientConfig = {
  entraId: process.env.AZURE_CLIENT_ID
    ? { clientId: process.env.AZURE_CLIENT_ID }
    : undefined,
  endpoint: process.env.REDIS_ENDPOINT ?? "localhost:6379",
  tls: process.env.REDIS_TLS === "true",
};

export const redisClient = await createResilientRedisClient(config);
