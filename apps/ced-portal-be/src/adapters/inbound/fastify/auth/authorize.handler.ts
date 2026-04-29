import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AuthorizeInput } from "../../../../application/use-cases/auth/authorize.use-case.js";

const authorizeSchema = zod
  .object({
    query: zod.object({
      id: zod.string().min(1),
    }),
  })
  .transform(({ query }) => ({
    id: query.id,
  }));

export const mountAuthorizeHandler = <O>(
  fastify: FastifyInstance,
  useCase: UseCase<AuthorizeInput, O, BaseError>,
) => {
  fastify.get(
    "/api/authorize",
    createHttpHandler(useCase, createHttpRequestValidator(authorizeSchema)),
  );
};
