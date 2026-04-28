import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance } from "fastify";
import type { z } from "zod";

import {
  createHttpHandler,
  createHttpRequestValidator,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AcsOutput } from "../../../../application/use-cases/auth/acs.use-case.js";

const acsSchema = zod.object({
  query: zod.object({
    token: zod.string().min(1),
  }),
});

type AcsValidatedInput = z.infer<typeof acsSchema>;

export const mountAcsHandler = (
  fastify: FastifyInstance,
  useCase: UseCase<AcsValidatedInput, AcsOutput, BaseError>,
) => {
  fastify.get(
    "/api/acs",
    createHttpHandler(useCase, createHttpRequestValidator(acsSchema), {
      redirect: true,
      redirectUrlBuilder: ({ sessionId }) => `/api/authorize?id=${sessionId}`,
    }),
  );
};
