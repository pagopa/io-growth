import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { OperatorListOpportunityCategoriesUseCase } from "../../../../application/use-cases/opportunities/operator-list-opportunity-categories.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { ListOpportunityCategoriesResponse } from "../contracts/categories/categories.js";

const operatorListOpportunityCategoriesValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(OperatorSessionSchema, emptyValidator, () => ({})),
);

const operatorListOpportunityCategoriesFormatter = createHttpResponseFormatter(
  ListOpportunityCategoriesResponse,
);

export const mountOperatorListOpportunityCategoriesHandler = (
  fastify: FastifyInstance,
  useCase: OperatorListOpportunityCategoriesUseCase,
) => {
  fastify.get(
    "/api/opportunity-categories",
    createHttpHandler(
      useCase,
      operatorListOpportunityCategoriesValidator,
      { successCode: 200 },
      operatorListOpportunityCategoriesFormatter,
    ),
  );
};
