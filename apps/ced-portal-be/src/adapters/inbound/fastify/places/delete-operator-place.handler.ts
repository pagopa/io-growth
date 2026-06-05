import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { DeleteOperatorPlaceUseCase } from "../../../../application/use-cases/places/delete-operator-place.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { DeleteOperatorPlaceParams } from "../contracts/places/places.js";

const deleteHttpSchema = zod.object({
  path: DeleteOperatorPlaceParams,
});

const deleteValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(deleteHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId,
    placeId: path.placeId,
  }),
);

export const mountDeleteOperatorPlaceHandler = (
  fastify: FastifyInstance,
  useCase: DeleteOperatorPlaceUseCase,
) => {
  fastify.delete(
    "/api/operator/places/:placeId",
    createHttpHandler(useCase, deleteValidator, { successCode: 204 }),
  );
};
