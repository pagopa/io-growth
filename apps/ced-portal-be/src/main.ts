import Fastify from "fastify";

import {
  mountAcsHandler,
  mountAuthorizeHandler,
  mountInfoHandler,
} from "./adapters/inbound/fastify/index.js";
import { dbClient } from "./adapters/outbound/drizzle/client.js";
import { createDrizzleOperatorStore } from "./adapters/outbound/drizzle/operator-store.drizzle.js";
import { redisClient } from "./adapters/outbound/redis/client.js";
import { createRedisSessionStore } from "./adapters/outbound/redis/session-store.redis.js";
import { makeAcsUseCase } from "./application/use-cases/acs.use-case.js";
import { makeAuthorizeUseCase } from "./application/use-cases/authorize.use-case.js";
import { getInfoUseCase } from "./application/use-cases/info.use-case.js";

const host = process.env.HOST ?? "0.0.0.0";
const portValue = process.env.PORT;
const port = portValue ? Number.parseInt(portValue, 10) : 8080;

if (Number.isNaN(port)) {
  throw new Error("PORT environment variable must be a valid integer");
}

const sessionStore = createRedisSessionStore(redisClient);
const operatorStore = createDrizzleOperatorStore(dbClient);

const app = Fastify();

mountInfoHandler(app, getInfoUseCase);
mountAcsHandler(app, makeAcsUseCase(sessionStore, operatorStore));
mountAuthorizeHandler(app, makeAuthorizeUseCase(sessionStore));

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
  await dbClient.closeConnection();
});

await app.listen({ host, port });

console.log(`Server listening on http://${host}:${port}`);
