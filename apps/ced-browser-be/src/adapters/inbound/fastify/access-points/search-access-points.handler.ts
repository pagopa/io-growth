import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { SearchAccessPointsUseCase } from "../../../../application/use-cases/places/search-access-points.use-case.js";

import { CitizenSessionSchema } from "../auth/session.js";
import {
  SearchAccessPointsQueryParams,
  SearchAccessPointsResponse,
} from "../contracts/access-points/access-points.js";

const searchAccessPointsHttpSchema = z.object({
  query: SearchAccessPointsQueryParams,
});

const searchAccessPointsValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(searchAccessPointsHttpSchema),
  (_session, { query }) => ({ limit: query.limit, query: query.q }),
);

const searchAccessPointsFormatter = createHttpResponseFormatter(
  SearchAccessPointsResponse,
);

export const mountSearchAccessPointsHandler = (
  fastify: FastifyInstance,
  useCase: SearchAccessPointsUseCase,
) => {
  fastify.get(
    "/api/entities/search",
    createHttpHandler(
      async (input) => {
        const result = await useCase(input);
        return result.map((items) => ({ items, total: items.length }));
      },
      searchAccessPointsValidator,
      { successCode: 200 },
      searchAccessPointsFormatter,
    ),
  );
};
