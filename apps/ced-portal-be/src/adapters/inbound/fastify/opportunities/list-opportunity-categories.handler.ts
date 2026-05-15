import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { ListOpportunityCategoriesUseCase } from "../../../../application/use-cases/opportunities/list-opportunity-categories.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { ListOpportunityCategoriesResponse } from "../contracts/categories/categories.js";

const listOpportunityCategoriesValidator = withSession(
  OperatorSessionSchema,
  emptyValidator,
  () => ({}),
);

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
      listOpportunityCategoriesValidator,
      { successCode: 200 },
      listOpportunityCategoriesFormatter,
    ),
  );
};
