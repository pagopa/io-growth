import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorDeleteOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-delete-opportunity.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  OperatorDeleteOpportunityBody,
  OperatorDeleteOpportunityParams,
} from "../contracts/opportunities/opportunities.js";

const operatorDeleteOpportunityHttpSchema = zod.object({
  body: OperatorDeleteOpportunityBody.optional(),
  path: OperatorDeleteOpportunityParams,
});

const operatorDeleteOpportunityValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorDeleteOpportunityHttpSchema),
    (session, { body, path }) => ({
      deletionMessage: body?.deletionMessage,
      operatorId: session.operatorId,
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountOperatorDeleteOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: OperatorDeleteOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/delete",
    createHttpHandler(useCase, operatorDeleteOpportunityValidator, {
      successCode: 204,
    }),
  );
};
