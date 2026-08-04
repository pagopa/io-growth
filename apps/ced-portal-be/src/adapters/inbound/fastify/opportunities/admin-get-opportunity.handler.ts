import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { AdminGetOpportunityUseCase } from "../../../../application/use-cases/opportunities/admin-get-opportunity.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  GetOpportunityParams,
  GetOpportunityResponse,
} from "../contracts/opportunities/opportunities.js";

const getOpportunityHttpSchema = z.object({
  path: GetOpportunityParams,
});

const getOpportunityValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(getOpportunityHttpSchema),
    (_session, { path }) => ({
      opportunityId: path.opportunityId,
    }),
  ),
);

const getOpportunityFormatter = createHttpResponseFormatter(
  GetOpportunityResponse,
);

export const mountAdminGetOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: AdminGetOpportunityUseCase,
) => {
  fastify.get(
    "/api/opportunities/:opportunityId",
    createHttpHandler(
      useCase,
      getOpportunityValidator,
      { successCode: 200 },
      getOpportunityFormatter,
    ),
  );
};
