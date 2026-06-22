import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { GetOpportunityUseCase } from "../../../../application/use-cases/opportunities/get-opportunity.use-case.js";

import { LANGUAGE_VALUES } from "../../../../domain/ports/outbound/persistence/place.repository.js";
import { CitizenSessionSchema } from "../auth/session.js";
import {
  GetOpportunityParams,
  GetOpportunityResponse,
} from "../contracts/opportunities/opportunities.js";

const getOpportunityHttpSchema = z.object({
  headers: z.object({
    "accept-language": z.enum(LANGUAGE_VALUES).optional(),
  }),
  path: GetOpportunityParams,
});

const getOpportunityValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(getOpportunityHttpSchema),
  (_session, { headers, path }) => ({
    language: headers["accept-language"],
    opportunityId: path.opportunityId,
  }),
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
