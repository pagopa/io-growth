import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorCreateProfileUseCase } from "../../../../application/use-cases/profile/operator-create-profile.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  CreateOperatorProfileBody,
  GetOperatorProfileResponse,
} from "../contracts/profile/profile.js";

const operatorCreateProfileHttpSchema = zod.object({
  body: CreateOperatorProfileBody,
});

const operatorCreateProfileValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorCreateProfileHttpSchema),
    (session, { body }) => ({
      displayName: body.displayName,
      operatorId: session.operatorId,
      place: body.place,
    }),
  ),
);

const operatorCreateProfileFormatter = createHttpResponseFormatter(
  GetOperatorProfileResponse,
);

export const mountOperatorCreateProfileHandler = (
  fastify: FastifyInstance,
  useCase: OperatorCreateProfileUseCase,
) => {
  fastify.post(
    "/api/operator/profile",
    createHttpHandler(
      useCase,
      operatorCreateProfileValidator,
      {
        successCode: 201,
      },
      operatorCreateProfileFormatter,
    ),
  );
};
