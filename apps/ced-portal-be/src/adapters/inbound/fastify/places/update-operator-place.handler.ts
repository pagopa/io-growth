import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { UpdateOperatorPlaceUseCase } from "../../../../application/use-cases/places/update-operator-place.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  UpdateOperatorPlaceBody,
  UpdateOperatorPlaceParams,
} from "../contracts/places/places.js";

const updateHttpSchema = zod.object({
  body: UpdateOperatorPlaceBody,
  path: UpdateOperatorPlaceParams,
});

const updateValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(updateHttpSchema),
  (session, { body, path }) => ({
    operatorId: session.operatorId,
    place: { ...body, supportContacts: body.supportContacts ?? [] },
    placeId: path.placeId,
  }),
);

export const mountUpdateOperatorPlaceHandler = (
  fastify: FastifyInstance,
  useCase: UpdateOperatorPlaceUseCase,
) => {
  fastify.put(
    "/api/operator/places/:placeId",
    createHttpHandler(useCase, updateValidator, { successCode: 204 }),
  );
};
