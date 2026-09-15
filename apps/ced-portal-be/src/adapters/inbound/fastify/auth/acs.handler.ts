import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type {
  AcsInput,
  AcsOutput,
} from "../../../../application/use-cases/auth/acs.use-case.js";

const acsSchema = zod
  .object({
    headers: zod.object({
      authorization: zod
        .string()
        .regex(/^Bearer\s+.+$/i)
        .transform((value) => value.replace(/^Bearer\s+/i, "")),
    }),
  })
  .transform(({ headers }) => ({
    token: headers.authorization,
  }));

export const mountAcsHandler = (
  fastify: FastifyInstance,
  useCase: UseCase<AcsInput, AcsOutput, BaseError>,
) => {
  fastify.get(
    "/api/acs",
    createHttpHandler(useCase, createHttpRequestValidator(acsSchema)),
  );
};
