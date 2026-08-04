import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { CheckRequestUseCase } from "../../../../application/use-cases/status/check-request.use-case.js";

import { CardRequestSessionSchema } from "../auth/session.js";

const getApplicationStatusValidator = withSession(
  CardRequestSessionSchema,
  emptyValidator,
  (session) => ({
    familyName: session.familyName,
    fiscalCode: session.fiscalCode,
    givenName: session.givenName,
  }),
);

export const mountGetApplicationStatusHandler = (
  fastify: FastifyInstance,
  useCase: CheckRequestUseCase,
) => {
  fastify.get(
    "/api/status",
    createHttpHandler(useCase, getApplicationStatusValidator, {
      successCode: 200,
    }),
  );
};
