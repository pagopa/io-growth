import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorGetPlaceUseCase } from "../../../../application/use-cases/places/operator-get-place.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  GetOperatorPlaceParams,
  GetOperatorPlaceResponse,
} from "../contracts/places/places.js";

const operatorGetPlaceHttpSchema = zod.object({
  path: GetOperatorPlaceParams,
});

const operatorGetPlaceValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorGetPlaceHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      placeId: path.placeId,
    }),
  ),
);

const operatorGetPlaceFormatter = createHttpResponseFormatter(
  GetOperatorPlaceResponse,
);

export const mountOperatorGetPlaceHandler = (
  fastify: FastifyInstance,
  useCase: OperatorGetPlaceUseCase,
) => {
  fastify.get(
    "/api/operator/places/:placeId",
    createHttpHandler(
      useCase,
      operatorGetPlaceValidator,
      { successCode: 200 },
      operatorGetPlaceFormatter,
    ),
  );
};
