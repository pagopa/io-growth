import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  createMultipartRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type {
  OperatorCreateProfileInput,
  OperatorCreateProfileUseCase,
} from "../../../../application/use-cases/profile/operator-create-profile.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  CreateOperatorProfileBody,
  GetOperatorProfileResponse,
} from "../contracts/profile/profile.js";

const operatorCreateProfileValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createMultipartRequestValidator(CreateOperatorProfileBody),
    (session, { image, logo, profile }): OperatorCreateProfileInput => ({
      ...profile,
      image,
      logo,
      operatorId: session.operatorId,
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
