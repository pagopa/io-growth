import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminRepublishOpportunityUseCase } from "../../../../application/use-cases/opportunities/admin-republish-opportunity.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { RepublishOpportunityParams } from "../contracts/opportunities/opportunities.js";

const adminRepublishOpportunityHttpSchema = zod.object({
  path: RepublishOpportunityParams,
});

const adminRepublishOpportunityValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminRepublishOpportunityHttpSchema),
    (_session, { path }) => ({
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountAdminRepublishOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: AdminRepublishOpportunityUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/republish",
    createHttpHandler(useCase, adminRepublishOpportunityValidator, {
      successCode: 204,
    }),
  );
};
