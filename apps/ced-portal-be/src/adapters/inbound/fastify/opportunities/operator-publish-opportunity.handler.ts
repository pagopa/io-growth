import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { PublishOpportunityUseCase } from "../../../../application/use-cases/opportunities/publish-opportunity.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { OperatorPublishOpportunityParams } from "../contracts/opportunities/opportunities.js";

const operatorPublishOpportunityHttpSchema = zod.object({
  path: OperatorPublishOpportunityParams,
});

const operatorPublishOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(operatorPublishOpportunityHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
  }),
);

export const mountOperatorPublishOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: PublishOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/publish",
    createHttpHandler(useCase, operatorPublishOpportunityValidator, {
      successCode: 204,
    }),
  );
};
