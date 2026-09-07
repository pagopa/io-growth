import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorGetOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-get-opportunity.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  GetOperatorOpportunityParams,
  GetOperatorOpportunityResponse,
} from "../contracts/opportunities/opportunities.js";

const operatorGetOpportunityHttpSchema = zod.object({
  path: GetOperatorOpportunityParams,
});

const operatorGetOpportunityValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorGetOpportunityHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      opportunityId: path.opportunityId,
    }),
  ),
);

const operatorGetOpportunityFormatter = createHttpResponseFormatter(
  GetOperatorOpportunityResponse,
);

export const mountOperatorGetOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: OperatorGetOpportunityUseCase,
) => {
  fastify.get(
    "/api/operator/opportunities/:opportunityId",
    createHttpHandler(
      useCase,
      operatorGetOpportunityValidator,
      { successCode: 200 },
      operatorGetOpportunityFormatter,
    ),
  );
};
