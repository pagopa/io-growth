import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorRepublishOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-republish-opportunity.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { OperatorRepublishOpportunityParams } from "../contracts/opportunities/opportunities.js";

const operatorRepublishOpportunityHttpSchema = zod.object({
  path: OperatorRepublishOpportunityParams,
});

const operatorRepublishOpportunityValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorRepublishOpportunityHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountOperatorRepublishOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: OperatorRepublishOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/republish",
    createHttpHandler(useCase, operatorRepublishOpportunityValidator, {
      successCode: 204,
    }),
  );
};
