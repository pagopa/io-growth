import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  emptyValidator,
} from "@pagopa/io-core-adapter-fastify";

import type { InfoReadinessUseCase } from "../../../../application/use-cases/health/info-readiness.use-case.js";

export const mountInfoReadinessHandler = (
  fastify: FastifyInstance,
  useCase: InfoReadinessUseCase,
) => {
  fastify.get(
    "/api/info/readiness",
    createHttpHandler(useCase, emptyValidator),
  );
};
