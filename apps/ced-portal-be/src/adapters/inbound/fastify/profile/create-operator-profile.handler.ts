import type { FastifyInstance } from "fastify";

import {
  createAuthenticatedInputValidator,
  createHttpHandler,
} from "@pagopa/io-core-adapter-fastify";

import type { CreateOperatorProfileUseCase } from "../../../../application/use-cases/profile/create-operator-profile.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { CreateOperatorProfileBody } from "../contracts/profile/profile.js";

const createOperatorProfileValidator = createAuthenticatedInputValidator(
  OperatorSessionSchema,
  CreateOperatorProfileBody,
  (session, body) => ({
    displayName: body.displayName,
    operatorId: session.operatorId,
    place: body.place,
  }),
);

export const mountCreateOperatorProfileHandler = (
  fastify: FastifyInstance,
  useCase: CreateOperatorProfileUseCase,
) => {
  fastify.post(
    "/api/operator/profile",
    createHttpHandler(useCase, createOperatorProfileValidator, {
      successCode: 201,
    }),
  );
};
