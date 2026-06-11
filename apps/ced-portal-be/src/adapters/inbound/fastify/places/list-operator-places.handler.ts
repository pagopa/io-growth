import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { ListOperatorPlacesUseCase } from "../../../../application/use-cases/places/list-operator-places.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { ListOperatorPlacesResponse } from "../contracts/places/places.js";

const listOperatorPlacesValidator = withSession(
  OperatorSessionSchema,
  emptyValidator,
  (session) => ({ operatorId: session.operatorId }),
);

const listOperatorPlacesFormatter = createHttpResponseFormatter(
  ListOperatorPlacesResponse,
);

export const mountListOperatorPlacesHandler = (
  fastify: FastifyInstance,
  useCase: ListOperatorPlacesUseCase,
) => {
  fastify.get(
    "/api/operator/places",
    createHttpHandler(
      useCase,
      listOperatorPlacesValidator,
      { successCode: 200 },
      listOperatorPlacesFormatter,
    ),
  );
};
