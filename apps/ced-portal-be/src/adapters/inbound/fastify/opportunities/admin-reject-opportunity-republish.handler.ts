import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminRejectOpportunityRepublishUseCase } from "../../../../application/use-cases/opportunities/admin-reject-opportunity-republish.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  RejectOpportunityRepublishBody,
  RejectOpportunityRepublishParams,
} from "../contracts/opportunities/opportunities.js";

const adminRejectOpportunityRepublishHttpSchema = zod.object({
  body: RejectOpportunityRepublishBody,
  path: RejectOpportunityRepublishParams,
});

const adminRejectOpportunityRepublishValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminRejectOpportunityRepublishHttpSchema),
    (_session, { body, path }) => ({
      opportunityId: path.opportunityId,
      republishRejectionMessage: body.republishRejectionMessage,
    }),
  ),
);

export const mountAdminRejectOpportunityRepublishHandler = (
  fastify: FastifyInstance,
  useCase: AdminRejectOpportunityRepublishUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/republish/reject",
    createHttpHandler(useCase, adminRejectOpportunityRepublishValidator, {
      successCode: 204,
    }),
  );
};
