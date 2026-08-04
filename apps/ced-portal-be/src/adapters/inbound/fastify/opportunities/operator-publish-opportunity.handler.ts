import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorPublishOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-publish-opportunity.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { OperatorPublishOpportunityParams } from "../contracts/opportunities/opportunities.js";

const operatorPublishOpportunityHttpSchema = zod.object({
  path: OperatorPublishOpportunityParams,
});

const operatorPublishOpportunityValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorPublishOpportunityHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountOperatorPublishOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: OperatorPublishOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/publish",
    createHttpHandler(useCase, operatorPublishOpportunityValidator, {
      successCode: 204,
    }),
  );
};
