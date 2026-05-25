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

const AUTHORIZE_PAGE_BASE_URL = process.env.CED_PORTAL_FE_BASE_URL;

const acsSchema = zod
  .object({
    query: zod.object({
      token: zod.string().min(1),
    }),
  })
  .transform(({ query }) => ({
    token: query.token,
  }));

export const mountAcsHandler = (
  fastify: FastifyInstance,
  useCase: UseCase<AcsInput, AcsOutput, BaseError>,
) => {
  fastify.get(
    "/api/acs",
    createHttpHandler(useCase, createHttpRequestValidator(acsSchema), {
      redirect: true,
      redirectUrlBuilder: ({ sessionId }) =>
        `${AUTHORIZE_PAGE_BASE_URL}/authorize?id=${sessionId}`,
    }),
  );
};
