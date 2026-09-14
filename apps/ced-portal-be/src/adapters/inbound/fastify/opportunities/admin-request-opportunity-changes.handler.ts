import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { AdminRequestOpportunityChangesUseCase } from "../../../../application/use-cases/opportunities/admin-request-opportunity-changes.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  RequestOpportunityChangesBody,
  RequestOpportunityChangesParams,
} from "../contracts/opportunities/opportunities.js";

const requestOpportunityChangesHttpSchema = z.object({
  body: RequestOpportunityChangesBody,
  path: RequestOpportunityChangesParams,
});

const requestOpportunityChangesValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(requestOpportunityChangesHttpSchema),
    (_session, { body, path }) => ({
      opportunityId: path.opportunityId,
      rejectionMessage: body.rejectionMessage,
    }),
  ),
);

export const mountAdminRequestOpportunityChangesHandler = (
  fastify: FastifyInstance,
  useCase: AdminRequestOpportunityChangesUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/request-changes",
    createHttpHandler(useCase, requestOpportunityChangesValidator, {
      successCode: 204,
    }),
  );
};
