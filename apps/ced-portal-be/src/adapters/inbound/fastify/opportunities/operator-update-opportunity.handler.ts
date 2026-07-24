import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorUpdateOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-update-opportunity.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import {
  OperatorUpdateOpportunityBody,
  OperatorUpdateOpportunityParams,
} from "../contracts/opportunities/opportunities.js";

const operatorUpdateOpportunityHttpSchema = zod.object({
  body: OperatorUpdateOpportunityBody,
  path: OperatorUpdateOpportunityParams,
});

const operatorUpdateOpportunityValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(operatorUpdateOpportunityHttpSchema),
  (session, { body, path }) => ({
    beneficiaryBenefit: body.beneficiaryBenefit,
    caregiverBenefit: body.caregiverBenefit,
    categoryId: body.categoryId,
    dateFrom: body.dateFrom,
    dateTo: body.dateTo,
    expectedUpdatedAt: body.updatedAt,
    localizedMetadata: body.localizedMetadata,
    nationalTerritory: body.nationalTerritory,
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
    placeIds: body.placeIds,
    url: body.url,
  }),
);

export const mountOperatorUpdateOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: OperatorUpdateOpportunityUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId",
    createHttpHandler(useCase, operatorUpdateOpportunityValidator, {
      successCode: 204,
    }),
  );
};
