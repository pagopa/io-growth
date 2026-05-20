import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  emptyValidator,
} from "@pagopa/io-core-adapter-fastify";

export const mountInfoStartupHandler = <T>(
  fastify: FastifyInstance,
  useCase: UseCase<Record<string, never>, T, BaseError>,
) => {
  fastify.get("/api/info/startup", createHttpHandler(useCase, emptyValidator));
};
