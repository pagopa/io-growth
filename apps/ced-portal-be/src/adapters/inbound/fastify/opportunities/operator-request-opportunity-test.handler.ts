import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorRequestOpportunityTestUseCase } from "../../../../application/use-cases/opportunities/operator-request-opportunity-test.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { OperatorRequestOpportunityTestParams } from "../contracts/opportunities/opportunities.js";

const operatorRequestOpportunityTestHttpSchema = zod.object({
  path: OperatorRequestOpportunityTestParams,
});

const operatorRequestOpportunityTestValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorRequestOpportunityTestHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountOperatorRequestOpportunityTestHandler = (
  fastify: FastifyInstance,
  useCase: OperatorRequestOpportunityTestUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/request-test",
    createHttpHandler(useCase, operatorRequestOpportunityTestValidator, {
      successCode: 204,
    }),
  );
};
