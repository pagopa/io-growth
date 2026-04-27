import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance } from "fastify";
import type { z } from "zod";

import {
  createHttpHandler,
  createHttpRequestValidator,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

const acsSchema = zod.object({
  query: zod.object({
    token: zod.string().min(1),
  }),
});

type AcsValidatedInput = z.infer<typeof acsSchema>;

export const mountAcsHandler = <O>(
  fastify: FastifyInstance,
  useCase: UseCase<AcsValidatedInput, O, BaseError>,
) => {
  fastify.get(
    "/api/acs",
    createHttpHandler(useCase, createHttpRequestValidator(acsSchema), {
      redirect: true,
    }),
  );
};
