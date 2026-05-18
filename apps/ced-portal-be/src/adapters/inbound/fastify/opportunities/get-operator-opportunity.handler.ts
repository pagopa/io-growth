import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { GetOperatorOpportunityUseCase } from "../../../../application/use-cases/opportunities/get-operator-opportunity.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  GetOperatorOpportunityParams,
  GetOperatorOpportunityResponse,
} from "../contracts/opportunities/opportunities.js";

const getOperatorOpportunityHttpSchema = zod.object({
  path: GetOperatorOpportunityParams,
});

const getOperatorOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(getOperatorOpportunityHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
  }),
);

const getOperatorOpportunityFormatter = createHttpResponseFormatter(
  GetOperatorOpportunityResponse,
);

export const mountGetOperatorOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: GetOperatorOpportunityUseCase,
) => {
  fastify.get(
    "/api/operator/opportunities/:opportunityId",
    createHttpHandler(
      useCase,
      getOperatorOpportunityValidator,
      { successCode: 200 },
      getOperatorOpportunityFormatter,
    ),
  );
};
