import Fastify from "fastify";

import {
  mountAcsHandler,
  mountAuthorizeHandler,
  mountInfoHandler,
} from "./adapters/inbound/fastify/index.js";
import { dbClient } from "./adapters/outbound/drizzle/client.js";
import { createDrizzleOperatorRepository } from "./adapters/outbound/drizzle/drizzle-operator.repository.js";
import { redisClient } from "./adapters/outbound/redis/client.js";
import { createRedisSessionRepository } from "./adapters/outbound/redis/redis-session.repository.js";
import { makeAcsUseCase } from "./application/use-cases/auth/acs.use-case.js";
import { makeAuthorizeUseCase } from "./application/use-cases/auth/authorize.use-case.js";
import { getInfoUseCase } from "./application/use-cases/info.use-case.js";

const host = process.env.HOST ?? "0.0.0.0";
const portValue = process.env.PORT;
const port = portValue ? Number.parseInt(portValue, 10) : 8080;

if (Number.isNaN(port)) {
  throw new Error("PORT environment variable must be a valid integer");
}

const sessionRepository = createRedisSessionRepository(redisClient);
const operatorRepository = createDrizzleOperatorRepository(dbClient);

const app = Fastify();

mountInfoHandler(app, getInfoUseCase);
mountAcsHandler(app, makeAcsUseCase(sessionRepository, operatorRepository));
mountAuthorizeHandler(app, makeAuthorizeUseCase(sessionRepository));

app.addHook("onClose", async () => {
  await redisClient.closeConnection();
  await dbClient.closeConnection();
});

await app.listen({ host, port });

console.log(`Server listening on http://${host}:${port}`);
