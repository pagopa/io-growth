import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { RequestApprovalOperatorOpportunityUseCase } from "../../../../application/use-cases/opportunities/request-approval-operator-opportunity.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { RequestApprovalOperatorOpportunityParams } from "../contracts/opportunities/opportunities.js";

const requestApprovalOperatorOpportunityHttpSchema = zod.object({
  path: RequestApprovalOperatorOpportunityParams,
});

const requestApprovalOperatorOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(requestApprovalOperatorOpportunityHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
  }),
);

export const mountRequestApprovalOperatorOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: RequestApprovalOperatorOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/request-approval",
    createHttpHandler(useCase, requestApprovalOperatorOpportunityValidator, {
      successCode: 204,
    }),
  );
};
