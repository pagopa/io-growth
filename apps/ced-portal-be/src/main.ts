import Fastify from "fastify";

import { mountInfoHandler } from "./adapters/inbound/fastify/index.js";
import { getInfoUseCase } from "./application/use-cases/info.use-case.js";

const host = process.env.HOST ?? "0.0.0.0";
const portValue = process.env.PORT;
const port = portValue ? Number.parseInt(portValue, 10) : 80;

if (Number.isNaN(port)) {
  throw new Error("PORT environment variable must be a valid integer");
}

const app = Fastify();

mountInfoHandler(app, getInfoUseCase);

await app.listen({ host, port });

console.log(`Server listening on http://${host}:${port}`);
