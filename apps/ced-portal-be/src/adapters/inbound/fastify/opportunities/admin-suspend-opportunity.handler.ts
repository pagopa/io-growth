import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminSuspendOpportunityUseCase } from "../../../../application/use-cases/opportunities/admin-suspend-opportunity.use-case.js";

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
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminSuspendOpportunityHttpSchema),
    (session, { body, path }) => ({
      opportunityId: path.opportunityId,
      suspendFrom: body.suspendFrom,
      suspensionMessage: body.suspensionMessage,
      userType: session.userType,
    }),
  ),
);

export const mountAdminSuspendOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: AdminSuspendOpportunityUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/suspend",
    createHttpHandler(useCase, adminSuspendOpportunityValidator, {
      successCode: 204,
    }),
  );
};
