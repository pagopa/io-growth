import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { ListOperatorOpportunitiesUseCase } from "../../../../application/use-cases/opportunities/list-operator-opportunities.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  listOperatorOpportunitiesQueryLimitDefault,
  listOperatorOpportunitiesQueryLimitMax,
  listOperatorOpportunitiesQueryOffsetDefault,
  listOperatorOpportunitiesQueryOffsetMin,
  ListOperatorOpportunitiesQueryParams,
  ListOperatorOpportunitiesResponse,
} from "../contracts/opportunities/opportunities.js";

const listOperatorOpportunitiesQuerySchema =
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

const listOperatorOpportunitiesHttpSchema = zod.object({
  query: listOperatorOpportunitiesQuerySchema,
});

const listOperatorOpportunitiesValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(listOperatorOpportunitiesHttpSchema),
  (session, { query }) => ({
    categoryId: query.categoryId,
    limit: query.limit,
    offset: query.offset,
    operatorId: session.operatorId ?? "",
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
    status: query.status,
  }),
);

const listOperatorOpportunitiesFormatter = createHttpResponseFormatter(
  ListOperatorOpportunitiesResponse,
);

export const mountListOperatorOpportunitiesHandler = (
  fastify: FastifyInstance,
  useCase: ListOperatorOpportunitiesUseCase,
) => {
  fastify.get(
    "/api/operator/opportunities",
    createHttpHandler(
      useCase,
      listOperatorOpportunitiesValidator,
      { successCode: 200 },
      listOperatorOpportunitiesFormatter,
    ),
  );
};
