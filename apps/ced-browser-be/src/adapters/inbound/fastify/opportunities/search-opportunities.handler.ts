import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { SearchOpportunitiesUseCase } from "../../../../application/use-cases/opportunities/search-opportunities.use-case.js";

import { LANGUAGE_VALUES } from "../../../../domain/ports/outbound/persistence/place.repository.js";
import { CitizenSessionSchema } from "../auth/session.js";
import {
  SearchOpportunitiesQueryParams,
  SearchOpportunitiesResponse,
} from "../contracts/opportunities/opportunities.js";

const searchOpportunitiesQuerySchema = SearchOpportunitiesQueryParams.extend({
  limit: zod.coerce.number().int().optional(),
  offset: zod.coerce.number().int().optional(),
});

const searchOpportunitiesHttpSchema = zod.object({
  headers: zod.object({
    "accept-language": zod.enum(LANGUAGE_VALUES).optional(),
  }),
  query: searchOpportunitiesQuerySchema,
});

const searchOpportunitiesValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(searchOpportunitiesHttpSchema),
  (_session, { headers, query }) => ({
    language: headers["accept-language"],
    limit: query.limit,
    offset: query.offset,
    orderBy: query.orderBy,
    orderDirection: query.orderDirection,
  }),
);

const searchOpportunitiesFormatter = createHttpResponseFormatter(
  SearchOpportunitiesResponse,
);

export const mountSearchOpportunitiesHandler = (
  fastify: FastifyInstance,
  useCase: SearchOpportunitiesUseCase,
) => {
  fastify.get(
    "/api/opportunities/search",
    createHttpHandler(
      useCase,
      searchOpportunitiesValidator,
      { successCode: 200 },
      searchOpportunitiesFormatter,
    ),
  );
};
