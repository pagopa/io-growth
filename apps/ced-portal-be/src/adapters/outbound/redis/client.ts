import type { RedisClientConfig } from "@pagopa/io-core-adapter-redis";

import { createResilientRedisClient } from "@pagopa/io-core-adapter-redis";

const config: RedisClientConfig = {
  entraId: process.env.AZURE_CLIENT_ID
    ? { clientId: process.env.AZURE_CLIENT_ID }
    : undefined,
  host: process.env.REDIS_HOST ?? "localhost",
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT ?? "6379"),
  tls: process.env.REDIS_TLS === "true",
};

export const redisClient = await createResilientRedisClient(config);
