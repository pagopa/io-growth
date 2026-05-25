import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { RequestTestOperatorOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-request-opportunity-test.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { RequestTestOperatorOpportunityParams } from "../contracts/opportunities/opportunities.js";

const requestTestOperatorOpportunityHttpSchema = zod.object({
  path: RequestTestOperatorOpportunityParams,
});

const requestTestOperatorOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(requestTestOperatorOpportunityHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
  }),
);

export const mountRequestTestOperatorOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: RequestTestOperatorOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/request-test",
    createHttpHandler(useCase, requestTestOperatorOpportunityValidator, {
      successCode: 204,
    }),
  );
};
