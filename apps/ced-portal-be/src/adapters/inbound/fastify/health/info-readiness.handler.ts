import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  emptyValidator,
} from "@pagopa/io-core-adapter-fastify";

import type { GetInfoReadinessUseCase } from "../../../../application/use-cases/health/info-readiness.use-case.js";

export const mountInfoReadinessHandler = (
  fastify: FastifyInstance,
  useCase: GetInfoReadinessUseCase,
) => {
  fastify.get(
    "/api/info/readiness",
    createHttpHandler(useCase, emptyValidator),
  );
};
