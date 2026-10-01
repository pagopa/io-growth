import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminRequestOpportunityChangesUseCase } from "../../../../application/use-cases/opportunities/admin-request-opportunity-changes.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  RequestOpportunityChangesBody,
  RequestOpportunityChangesParams,
} from "../contracts/opportunities/opportunities.js";

const adminRequestOpportunityChangesHttpSchema = zod.object({
  body: RequestOpportunityChangesBody,
  path: RequestOpportunityChangesParams,
});

const adminRequestOpportunityChangesValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminRequestOpportunityChangesHttpSchema),
    (_session, { body, path }) => ({
      changeRequestMessage: body.changeRequestMessage,
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountAdminRequestOpportunityChangesHandler = (
  fastify: FastifyInstance,
  useCase: AdminRequestOpportunityChangesUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/request-changes",
    createHttpHandler(useCase, adminRequestOpportunityChangesValidator, {
      successCode: 204,
    }),
  );
};
