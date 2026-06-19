import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { PublishOpportunityUseCase } from "../../../../application/use-cases/opportunities/publish-opportunity.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { PublishOpportunityParams } from "../contracts/opportunities/opportunities.js";

const publishOpportunityHttpSchema = zod.object({
  path: PublishOpportunityParams,
});

const publishOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(publishOpportunityHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
  }),
);

export const mountPublishOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: PublishOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/publish",
    createHttpHandler(useCase, publishOpportunityValidator, {
      successCode: 204,
    }),
  );
};
