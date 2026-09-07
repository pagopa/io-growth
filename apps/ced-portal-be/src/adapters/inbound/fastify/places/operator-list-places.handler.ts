import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { OperatorListPlacesUseCase } from "../../../../application/use-cases/places/operator-list-places.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { ListOperatorPlacesResponse } from "../contracts/places/places.js";

const operatorListPlacesValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(OperatorSessionSchema, emptyValidator, (session) => ({
    operatorId: session.operatorId,
  })),
);

const operatorListPlacesFormatter = createHttpResponseFormatter(
  ListOperatorPlacesResponse,
);

export const mountOperatorListPlacesHandler = (
  fastify: FastifyInstance,
  useCase: OperatorListPlacesUseCase,
) => {
  fastify.get(
    "/api/operator/places",
    createHttpHandler(
      useCase,
      operatorListPlacesValidator,
      { successCode: 200 },
      operatorListPlacesFormatter,
    ),
  );
};
