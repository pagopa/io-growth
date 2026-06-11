import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { GetOperatorPlaceUseCase } from "../../../../application/use-cases/places/get-operator-place.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  GetOperatorPlaceParams,
  GetOperatorPlaceResponse,
} from "../contracts/places/places.js";

const getOperatorPlaceHttpSchema = zod.object({
  path: GetOperatorPlaceParams,
});

const getOperatorPlaceValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(getOperatorPlaceHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId ?? "",
    placeId: path.placeId,
  }),
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
