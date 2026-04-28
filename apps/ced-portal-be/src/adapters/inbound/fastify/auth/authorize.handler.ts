import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance } from "fastify";
import type { z } from "zod";

import {
  createHttpHandler,
  createHttpRequestValidator,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

const authorizeSchema = zod.object({
  query: zod.object({
    id: zod.string().min(1),
  }),
});

type AuthorizeValidatedInput = z.infer<typeof authorizeSchema>;

export const mountAuthorizeHandler = <O>(
  fastify: FastifyInstance,
  useCase: UseCase<AuthorizeValidatedInput, O, BaseError>,
) => {
  fastify.get(
    "/api/authorize",
    createHttpHandler(useCase, createHttpRequestValidator(authorizeSchema)),
  );
};
