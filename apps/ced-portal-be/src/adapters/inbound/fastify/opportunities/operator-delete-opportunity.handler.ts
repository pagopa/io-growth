import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { DeleteOpportunityUseCase } from "../../../../application/use-cases/opportunities/delete-opportunity.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  OperatorDeleteOpportunityBody,
  OperatorDeleteOpportunityParams,
} from "../contracts/opportunities/opportunities.js";

const operatorDeleteOpportunityHttpSchema = zod.object({
  body: OperatorDeleteOpportunityBody.optional(),
  path: OperatorDeleteOpportunityParams,
});

const operatorDeleteOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(operatorDeleteOpportunityHttpSchema),
  (session, { body, path }) => ({
    deletionMessage: body?.deletionMessage,
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
  }),
);

export const mountOperatorDeleteOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: DeleteOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/delete",
    createHttpHandler(useCase, operatorDeleteOpportunityValidator, {
      successCode: 204,
    }),
  );
};
