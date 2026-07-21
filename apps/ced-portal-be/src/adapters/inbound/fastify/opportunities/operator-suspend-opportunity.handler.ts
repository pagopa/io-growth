import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorSuspendOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-suspend-opportunity.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  OperatorSuspendOpportunityBody,
  OperatorSuspendOpportunityParams,
} from "../contracts/opportunities/opportunities.js";

const operatorSuspendOpportunityHttpSchema = zod.object({
  body: OperatorSuspendOpportunityBody,
  path: OperatorSuspendOpportunityParams,
});

const operatorSuspendOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(operatorSuspendOpportunityHttpSchema),
  (session, { body, path }) => ({
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
    suspendFrom: body.suspendFrom,
    suspensionMessage: body.suspensionMessage,
  }),
);

export const mountOperatorSuspendOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: OperatorSuspendOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/suspension/schedule",
    createHttpHandler(useCase, operatorSuspendOpportunityValidator, {
      successCode: 204,
    }),
  );
};
