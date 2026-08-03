import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminListOpportunitiesUseCase } from "../../../../application/use-cases/opportunities/admin-list-opportunities.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  adminListOpportunitiesQueryLimitDefault,
  adminListOpportunitiesQueryLimitMax,
  adminListOpportunitiesQueryOffsetDefault,
  adminListOpportunitiesQueryOffsetMin,
  AdminListOpportunitiesQueryParams,
  AdminListOpportunitiesResponse,
} from "../contracts/opportunities/opportunities.js";

const adminListOpportunitiesQuerySchema =
  AdminListOpportunitiesQueryParams.extend({
    limit: zod.coerce
      .number()
      .int()
      .min(1)
      .max(adminListOpportunitiesQueryLimitMax)
      .default(adminListOpportunitiesQueryLimitDefault),
    offset: zod.coerce
      .number()
      .int()
      .min(adminListOpportunitiesQueryOffsetMin)
      .default(adminListOpportunitiesQueryOffsetDefault),
  });

const adminListOpportunitiesHttpSchema = zod.object({
  query: adminListOpportunitiesQuerySchema,
});

const adminListOpportunitiesValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminListOpportunitiesHttpSchema),
    (_session, { query }) => ({
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
    }),
  ),
);

const adminListOpportunitiesFormatter = createHttpResponseFormatter(
  AdminListOpportunitiesResponse,
);

export const mountAdminListOpportunitiesHandler = (
  fastify: FastifyInstance,
  useCase: AdminListOpportunitiesUseCase,
) => {
  fastify.get(
    "/api/opportunities",
    createHttpHandler(
      useCase,
      adminListOpportunitiesValidator,
      { successCode: 200 },
      adminListOpportunitiesFormatter,
    ),
  );
};
