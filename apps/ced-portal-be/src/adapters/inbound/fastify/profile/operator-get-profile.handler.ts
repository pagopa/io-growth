import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { OperatorGetProfileUseCase } from "../../../../application/use-cases/profile/operator-get-profile.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { GetOperatorProfileResponse } from "../contracts/profile/profile.js";

const operatorGetProfileValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(OperatorSessionSchema, emptyValidator, (session) => ({
    operatorId: session.operatorId,
  })),
);

const operatorGetProfileFormatter = createHttpResponseFormatter(
  GetOperatorProfileResponse,
);

export const mountOperatorGetProfileHandler = (
  fastify: FastifyInstance,
  useCase: OperatorGetProfileUseCase,
) => {
  fastify.get(
    "/api/operator/profile",
    createHttpHandler(
      useCase,
      operatorGetProfileValidator,
      { successCode: 200 },
      operatorGetProfileFormatter,
    ),
  );
};
