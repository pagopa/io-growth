import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { CreateOperatorPlaceUseCase } from "../../../../application/use-cases/places/create-operator-place.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { CreateOperatorPlaceBody } from "../contracts/places/places.js";

const createOperatorPlaceHttpSchema = zod.object({
  body: CreateOperatorPlaceBody,
});

const createOperatorPlaceValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(createOperatorPlaceHttpSchema),
  (session, { body }) => ({
    operatorId: session.operatorId,
    place: body,
  }),
);

export const mountCreateOperatorPlaceHandler = (
  fastify: FastifyInstance,
  useCase: CreateOperatorPlaceUseCase,
) => {
  fastify.post(
    "/api/operator/places",
    createHttpHandler(useCase, createOperatorPlaceValidator, {
      successCode: 201,
    }),
  );
};
