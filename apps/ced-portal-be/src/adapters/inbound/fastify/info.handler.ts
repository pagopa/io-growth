import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  emptyValidator,
} from "@pagopa/io-core-adapter-fastify";

export const mountInfoHandler = <O>(
  fastify: FastifyInstance,
  useCase: UseCase<Record<string, never>, O, BaseError>,
) => {
  fastify.get("/api/info", createHttpHandler(useCase, emptyValidator));
};
