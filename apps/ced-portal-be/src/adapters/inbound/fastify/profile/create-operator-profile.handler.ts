import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { CreateOperatorProfileUseCase } from "../../../../application/use-cases/profile/create-operator-profile.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  CreateOperatorProfileBody,
  GetOperatorProfileResponse,
} from "../contracts/profile/profile.js";

const createProfileHttpSchema = zod.object({
  body: CreateOperatorProfileBody,
});

const createOperatorProfileValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(createProfileHttpSchema),
  (session, { body }) => ({
    displayName: body.displayName,
    operatorId: session.operatorId ?? "",
    place: body.place,
  }),
);

const createOperatorProfileFormatter = createHttpResponseFormatter(
  GetOperatorProfileResponse,
);

export const mountCreateOperatorProfileHandler = (
  fastify: FastifyInstance,
  useCase: CreateOperatorProfileUseCase,
) => {
  fastify.post(
    "/api/operator/profile",
    createHttpHandler(
      useCase,
      createOperatorProfileValidator,
      {
        successCode: 201,
      },
      createOperatorProfileFormatter,
    ),
  );
};
