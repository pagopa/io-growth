import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorRequestOpportunityRepublishUseCase } from "../../../../application/use-cases/opportunities/operator-request-opportunity-republish.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  OperatorRequestOpportunityRepublishBody,
  OperatorRequestOpportunityRepublishParams,
} from "../contracts/opportunities/opportunities.js";

const operatorRequestOpportunityRepublishHttpSchema = zod.object({
  body: OperatorRequestOpportunityRepublishBody,
  path: OperatorRequestOpportunityRepublishParams,
});

const operatorRequestOpportunityRepublishValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorRequestOpportunityRepublishHttpSchema),
    (session, { body, path }) => ({
      operatorId: session.operatorId,
      opportunityId: path.opportunityId,
      republishMessage: body.republishMessage,
    }),
  ),
);

export const mountOperatorRequestOpportunityRepublishHandler = (
  fastify: FastifyInstance,
  useCase: OperatorRequestOpportunityRepublishUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/republish/request",
    createHttpHandler(useCase, operatorRequestOpportunityRepublishValidator, {
      successCode: 204,
    }),
  );
};
