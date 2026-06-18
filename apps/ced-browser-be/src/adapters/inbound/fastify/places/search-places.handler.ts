import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { SearchPlacesUseCase } from "../../../../application/use-cases/places/search-places.use-case.js";

import { CitizenSessionSchema } from "../auth/session.js";
import {
  SearchPlacesQueryParams,
  SearchPlacesResponse,
} from "../contracts/places/places.js";

const searchPlacesHttpSchema = z.object({
  query: SearchPlacesQueryParams,
});

const searchPlacesValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(searchPlacesHttpSchema),
  (_session, { query }) => ({ limit: query.limit, query: query.q }),
);

const searchPlacesFormatter = createHttpResponseFormatter(SearchPlacesResponse);

export const mountSearchPlacesHandler = (
  fastify: FastifyInstance,
  useCase: SearchPlacesUseCase,
) => {
  fastify.get(
    "/api/search",
    createHttpHandler(
      async (input) => {
        const result = await useCase(input);
        return result.map((items) => ({ items, total: items.length }));
      },
      searchPlacesValidator,
      { successCode: 200 },
      searchPlacesFormatter,
    ),
  );
};
