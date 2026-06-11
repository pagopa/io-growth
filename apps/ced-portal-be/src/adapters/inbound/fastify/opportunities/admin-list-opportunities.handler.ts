import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { ListOpportunitiesUseCase } from "../../../../application/use-cases/opportunities/admin-list-opportunities.use-case.js";

import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  listAdminOpportunitiesQueryLimitDefault,
  listAdminOpportunitiesQueryLimitMax,
  listAdminOpportunitiesQueryOffsetDefault,
  listAdminOpportunitiesQueryOffsetMin,
  ListAdminOpportunitiesQueryParams,
  ListAdminOpportunitiesResponse,
} from "../contracts/opportunities/opportunities.js";

const listAdminOpportunitiesQuerySchema =
  ListAdminOpportunitiesQueryParams.extend({
    limit: zod.coerce
      .number()
      .int()
      .min(1)
      .max(listAdminOpportunitiesQueryLimitMax)
      .default(listAdminOpportunitiesQueryLimitDefault),
    offset: zod.coerce
      .number()
      .int()
      .min(listAdminOpportunitiesQueryOffsetMin)
      .default(listAdminOpportunitiesQueryOffsetDefault),
  });

const listAdminOpportunitiesHttpSchema = zod.object({
  query: listAdminOpportunitiesQuerySchema,
});

const listAdminOpportunitiesValidator = withUserTypeAuthorization(
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(listAdminOpportunitiesHttpSchema),
    (session, { query }) => ({
      categoryId: query.categoryId,
      dateFrom: query.dateFrom,
      dateTo: query.dateTo,
      limit: query.limit,
      offset: query.offset,
      operatorId: query.operatorId,
      search: query.search,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      status: query.status,
      userType: session.userType,
    }),
  ),
);

const listAdminOpportunitiesFormatter = createHttpResponseFormatter(
  ListAdminOpportunitiesResponse,
);

export const mountListAdminOpportunitiesHandler = (
  fastify: FastifyInstance,
  useCase: ListOpportunitiesUseCase,
) => {
  fastify.get(
    "/api/opportunities",
    createHttpHandler(
      useCase,
      listAdminOpportunitiesValidator,
      { successCode: 200 },
      listAdminOpportunitiesFormatter,
    ),
  );
};
