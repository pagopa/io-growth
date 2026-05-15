import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
} from "@pagopa/io-core-adapter-fastify";

import type { ListOpportunityCategoriesUseCase } from "../../../../application/use-cases/opportunities/list-opportunity-categories.use-case.js";

import { ListOpportunityCategoriesResponse } from "../contracts/categories/categories.js";

const listOpportunityCategoriesFormatter = createHttpResponseFormatter(
  ListOpportunityCategoriesResponse,
);

export const mountListOpportunityCategoriesHandler = (
  fastify: FastifyInstance,
  useCase: ListOpportunityCategoriesUseCase,
) => {
  fastify.get(
    "/api/opportunity-categories",
    createHttpHandler(
      useCase,
      emptyValidator,
      { successCode: 200 },
      listOpportunityCategoriesFormatter,
    ),
  );
};
