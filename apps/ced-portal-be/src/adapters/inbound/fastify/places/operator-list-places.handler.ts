import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorListPlacesUseCase } from "../../../../application/use-cases/places/operator-list-places.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  listOperatorPlacesQueryLimitDefault,
  listOperatorPlacesQueryLimitMax,
  listOperatorPlacesQueryOffsetDefault,
  listOperatorPlacesQueryOffsetMin,
  ListOperatorPlacesQueryParams,
  ListOperatorPlacesResponse,
} from "../contracts/places/places.js";

const operatorListPlacesQuerySchema = ListOperatorPlacesQueryParams.extend({
  limit: zod.coerce
    .number()
    .int()
    .min(1)
    .max(listOperatorPlacesQueryLimitMax)
    .default(listOperatorPlacesQueryLimitDefault),
  offset: zod.coerce
    .number()
    .int()
    .min(listOperatorPlacesQueryOffsetMin)
    .default(listOperatorPlacesQueryOffsetDefault),
});

const operatorListPlacesHttpSchema = zod.object({
  query: operatorListPlacesQuerySchema,
});

const operatorListPlacesValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorListPlacesHttpSchema),
    (session, { query }) => ({
      limit: query.limit,
      offset: query.offset,
      operatorId: session.operatorId,
      search: query.search,
      type: query.type,
    }),
  ),
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
