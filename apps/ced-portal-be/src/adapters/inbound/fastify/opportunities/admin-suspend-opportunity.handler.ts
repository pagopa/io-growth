import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminSuspendOpportunityUseCase } from "../../../../application/use-cases/opportunities/admin-suspend-opportunity.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  SuspendOpportunityBody,
  SuspendOpportunityParams,
} from "../contracts/opportunities/opportunities.js";

const adminSuspendOpportunityHttpSchema = zod.object({
  body: SuspendOpportunityBody,
  path: SuspendOpportunityParams,
});

const adminSuspendOpportunityValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminSuspendOpportunityHttpSchema),
    (_session, { body, path }) => ({
      opportunityId: path.opportunityId,
      suspendFrom: body.suspendFrom,
      suspensionMessage: body.suspensionMessage,
    }),
  ),
);

export const mountAdminSuspendOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: AdminSuspendOpportunityUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/suspension/schedule",
    createHttpHandler(useCase, adminSuspendOpportunityValidator, {
      successCode: 204,
    }),
  );
};
