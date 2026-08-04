import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorCreatePlaceUseCase } from "../../../../application/use-cases/places/operator-create-place.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  CreateOperatorPlaceBody,
  GetOperatorPlaceResponse,
} from "../contracts/places/places.js";

const operatorCreatePlaceHttpSchema = zod.object({
  body: CreateOperatorPlaceBody,
});

const operatorCreatePlaceValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorCreatePlaceHttpSchema),
    (session, { body }) => ({
      operatorId: session.operatorId,
      place: body,
    }),
  ),
);

const operatorCreatePlaceFormatter = createHttpResponseFormatter(
  GetOperatorPlaceResponse,
);

export const mountOperatorCreatePlaceHandler = (
  fastify: FastifyInstance,
  useCase: OperatorCreatePlaceUseCase,
) => {
  fastify.post(
    "/api/operator/places",
    createHttpHandler(
      useCase,
      operatorCreatePlaceValidator,
      {
        successCode: 201,
      },
      operatorCreatePlaceFormatter,
    ),
  );
};
