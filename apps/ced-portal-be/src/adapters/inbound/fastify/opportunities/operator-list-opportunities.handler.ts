import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorListOpportunitiesUseCase } from "../../../../application/use-cases/opportunities/operator-list-opportunities.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  listOperatorOpportunitiesQueryLimitDefault,
  listOperatorOpportunitiesQueryLimitMax,
  listOperatorOpportunitiesQueryOffsetDefault,
  listOperatorOpportunitiesQueryOffsetMin,
  ListOperatorOpportunitiesQueryParams,
  ListOperatorOpportunitiesResponse,
} from "../contracts/opportunities/opportunities.js";

const operatorListOpportunitiesQuerySchema =
  ListOperatorOpportunitiesQueryParams.extend({
    limit: zod.coerce
      .number()
      .int()
      .min(1)
      .max(listOperatorOpportunitiesQueryLimitMax)
      .default(listOperatorOpportunitiesQueryLimitDefault),
    offset: zod.coerce
      .number()
      .int()
      .min(listOperatorOpportunitiesQueryOffsetMin)
      .default(listOperatorOpportunitiesQueryOffsetDefault),
  });

const operatorListOpportunitiesHttpSchema = zod.object({
  query: operatorListOpportunitiesQuerySchema,
});

const operatorListOpportunitiesValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorListOpportunitiesHttpSchema),
    (session, { query }) => ({
      categoryId: query.categoryId,
      limit: query.limit,
      offset: query.offset,
      operatorId: session.operatorId,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
    }),
  ),
);

const operatorListOpportunitiesFormatter = createHttpResponseFormatter(
  ListOperatorOpportunitiesResponse,
);

export const mountOperatorListOpportunitiesHandler = (
  fastify: FastifyInstance,
  useCase: OperatorListOpportunitiesUseCase,
) => {
  fastify.get(
    "/api/operator/opportunities",
    createHttpHandler(
      useCase,
      operatorListOpportunitiesValidator,
      { successCode: 200 },
      operatorListOpportunitiesFormatter,
    ),
  );
};
