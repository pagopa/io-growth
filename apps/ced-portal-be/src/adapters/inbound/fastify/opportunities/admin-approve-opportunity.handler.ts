import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { ApproveOpportunityUseCase } from "../../../../application/use-cases/opportunities/approve-opportunity.use-case.js";

import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  ApproveOpportunityBody,
  ApproveOpportunityParams,
} from "../contracts/opportunities/opportunities.js";

const approveOpportunityHttpSchema = z.object({
  body: ApproveOpportunityBody.optional(),
  path: ApproveOpportunityParams,
});

const approveOpportunityValidator = withUserTypeAuthorization(
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(approveOpportunityHttpSchema),
    (session, { body, path }) => ({
      dateFrom: body?.dateFrom,
      opportunityId: path.opportunityId,
      userType: session.userType,
    }),
  ),
);

export const mountApproveOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: ApproveOpportunityUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/approve",
    createHttpHandler(
      useCase,
      approveOpportunityValidator,
      { successCode: 204 },
      createHttpResponseFormatter(z.void()),
    ),
  );
};
