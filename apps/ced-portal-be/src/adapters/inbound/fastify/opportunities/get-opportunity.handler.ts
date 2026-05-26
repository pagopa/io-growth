import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { GetOpportunityUseCase } from "../../../../application/use-cases/opportunities/get-opportunity.use-case.js";

import { AdminSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  GetOpportunityParams,
  GetOpportunityResponse,
} from "../contracts/opportunities/opportunities.js";

const getOpportunityHttpSchema = z.object({
  path: GetOpportunityParams,
});

const getOpportunityValidator = withUserTypeAuthorization(
  withSession(
    AdminSessionSchema,
    createHttpRequestValidator(getOpportunityHttpSchema),
    (session, { path }) => ({
      opportunityId: path.opportunityId,
      userType: session.userType,
    }),
  ),
);

const getOpportunityFormatter = createHttpResponseFormatter(
  GetOpportunityResponse,
);

export const mountGetOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: GetOpportunityUseCase,
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
