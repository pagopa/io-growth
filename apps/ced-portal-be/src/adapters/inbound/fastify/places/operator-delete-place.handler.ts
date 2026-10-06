import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorDeletePlaceUseCase } from "../../../../application/use-cases/places/operator-delete-place.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { DeleteOperatorPlaceParams } from "../contracts/places/places.js";

const operatorDeletePlaceHttpSchema = zod.object({
  path: DeleteOperatorPlaceParams,
});

const operatorDeletePlaceValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorDeletePlaceHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      placeId: path.placeId,
    }),
  ),
);

export const mountOperatorDeletePlaceHandler = (
  fastify: FastifyInstance,
  useCase: OperatorDeletePlaceUseCase,
) => {
  fastify.delete(
    "/api/operator/places/:placeId",
    createHttpHandler(useCase, operatorDeletePlaceValidator, {
      successCode: 204,
    }),
  );
};
