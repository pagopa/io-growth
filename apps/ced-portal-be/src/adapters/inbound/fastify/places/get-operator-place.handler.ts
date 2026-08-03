import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { GetOperatorPlaceUseCase } from "../../../../application/use-cases/places/get-operator-place.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  GetOperatorPlaceParams,
  GetOperatorPlaceResponse,
} from "../contracts/places/places.js";

const getOperatorPlaceHttpSchema = zod.object({
  path: GetOperatorPlaceParams,
});

const getOperatorPlaceValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(getOperatorPlaceHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      placeId: path.placeId,
    }),
  ),
);

const getOperatorPlaceFormatter = createHttpResponseFormatter(
  GetOperatorPlaceResponse,
);

export const mountGetOperatorPlaceHandler = (
  fastify: FastifyInstance,
  useCase: GetOperatorPlaceUseCase,
) => {
  fastify.get(
    "/api/operator/places/:placeId",
    createHttpHandler(
      useCase,
      getOperatorPlaceValidator,
      { successCode: 200 },
      getOperatorPlaceFormatter,
    ),
  );
};
