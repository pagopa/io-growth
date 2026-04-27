import type { RedisClientConfig } from "@pagopa/io-core-adapter-redis";

import { createRedisClient } from "@pagopa/io-core-adapter-redis";

const config: RedisClientConfig = {
  host: process.env.REDIS_HOST ?? "localhost",
  password: process.env.REDIS_PASSWORD,
  port: Number(process.env.REDIS_PORT ?? "6379"),
};

export const redisClient = await createRedisClient(config);
