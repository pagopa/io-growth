import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { AdminApproveOpportunityUseCase } from "../../../../application/use-cases/opportunities/admin-approve-opportunity.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
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
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(approveOpportunityHttpSchema),
    (_session, { body, path }) => ({
      dateFrom: body?.dateFrom,
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountAdminApproveOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: AdminApproveOpportunityUseCase,
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
