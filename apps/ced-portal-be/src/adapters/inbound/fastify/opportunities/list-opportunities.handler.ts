import type { InputValidator } from "@pagopa/io-core-domain";
import type { ValidationError } from "@pagopa/io-core-domain/errors";
import type { FastifyInstance, FastifyRequest } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { ForbiddenError } from "@pagopa/io-core-domain/errors";
import { err } from "neverthrow";
import { z as zod } from "zod";

import type { ListOpportunitiesUseCase } from "../../../../application/use-cases/opportunities/list-opportunities.use-case.js";

import { AdminSessionSchema } from "../auth/session.js";
import {
  listGlobalOpportunitiesQueryLimitDefault,
  listGlobalOpportunitiesQueryLimitMax,
  listGlobalOpportunitiesQueryOffsetDefault,
  listGlobalOpportunitiesQueryOffsetMin,
  ListGlobalOpportunitiesQueryParams,
  ListGlobalOpportunitiesResponse,
} from "../contracts/opportunities/opportunities.js";

const ALLOWED_USER_TYPES: readonly ("admin" | "operator" | "test_user")[] = [
  "admin",
  "test_user",
];

// InputValidator fixes the error type to ValidationError, but we need to return a ForbiddenError (403)
// here. The cast is safe at runtime because the error handler dispatches on the error's status code,
// not on the TypeScript type. A cleaner solution would require changing the InputValidator signature.
const withUserTypeAuthorization =
  <T extends { userType: "admin" | "operator" | "test_user" }>(
    innerValidator: InputValidator<FastifyRequest, T>,
  ): InputValidator<FastifyRequest, T> =>
  async (request) => {
    const result = await innerValidator(request);
    if (result.isErr()) return result;
    if (!ALLOWED_USER_TYPES.includes(result.value.userType)) {
      return err(new ForbiddenError() as unknown as ValidationError);
    }
    return result;
  };

const listGlobalOpportunitiesQuerySchema =
  ListGlobalOpportunitiesQueryParams.extend({
    limit: zod.coerce
      .number()
      .int()
      .min(1)
      .max(listGlobalOpportunitiesQueryLimitMax)
      .default(listGlobalOpportunitiesQueryLimitDefault),
    offset: zod.coerce
      .number()
      .int()
      .min(listGlobalOpportunitiesQueryOffsetMin)
      .default(listGlobalOpportunitiesQueryOffsetDefault),
  });

const listGlobalOpportunitiesHttpSchema = zod.object({
  query: listGlobalOpportunitiesQuerySchema,
});

const listGlobalOpportunitiesValidator = withUserTypeAuthorization(
  withSession(
    AdminSessionSchema,
    createHttpRequestValidator(listGlobalOpportunitiesHttpSchema),
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

const listGlobalOpportunitiesFormatter = createHttpResponseFormatter(
  ListGlobalOpportunitiesResponse,
);

export const mountListGlobalOpportunitiesHandler = (
  fastify: FastifyInstance,
  useCase: ListOpportunitiesUseCase,
) => {
  fastify.get(
    "/api/opportunities",
    createHttpHandler(
      useCase,
      listGlobalOpportunitiesValidator,
      { successCode: 200 },
      listGlobalOpportunitiesFormatter,
    ),
  );
};
