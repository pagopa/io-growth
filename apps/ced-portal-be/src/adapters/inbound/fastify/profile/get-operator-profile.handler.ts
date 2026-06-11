import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { GetOperatorProfileUseCase } from "../../../../application/use-cases/profile/get-operator-profile.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { GetOperatorProfileResponse } from "../contracts/profile/profile.js";

const getOperatorProfileValidator = withSession(
  OperatorSessionSchema,
  emptyValidator,
  (session) => ({ operatorId: session.operatorId }),
);

const getOperatorProfileFormatter = createHttpResponseFormatter(
  GetOperatorProfileResponse,
);

export const mountGetOperatorProfileHandler = (
  fastify: FastifyInstance,
  useCase: GetOperatorProfileUseCase,
) => {
  fastify.get(
    "/api/operator/profile",
    createHttpHandler(
      useCase,
      getOperatorProfileValidator,
      { successCode: 200 },
      getOperatorProfileFormatter,
    ),
  );
};
