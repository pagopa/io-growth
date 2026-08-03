import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { CreateOperatorOpportunityUseCase } from "../../../../application/use-cases/opportunities/create-operator-opportunity.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  CreateOperatorOpportunityBody,
  GetOperatorOpportunityResponse,
} from "../contracts/opportunities/opportunities.js";

const createOperatorOpportunityHttpSchema = zod.object({
  body: CreateOperatorOpportunityBody,
});

const createOperatorOpportunityValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(createOperatorOpportunityHttpSchema),
    (session, { body }) => ({
      beneficiaryBenefit: body.beneficiaryBenefit,
      caregiverBenefit: body.caregiverBenefit,
      categoryId: body.categoryId,
      dateFrom: body.dateFrom,
      dateTo: body.dateTo,
      localizedMetadata: body.localizedMetadata,
      nationalTerritory: body.nationalTerritory,
      operatorId: session.operatorId,
      placeIds: body.placeIds ?? [],
      url: body.url,
    }),
  ),
);

const createOperatorOpportunityFormatter = createHttpResponseFormatter(
  GetOperatorOpportunityResponse,
);

export const mountCreateOperatorOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: CreateOperatorOpportunityUseCase,
) => {
  fastify.post(
    "/api/operator/opportunities",
    createHttpHandler(
      useCase,
      createOperatorOpportunityValidator,
      {
        successCode: 201,
      },
      createOperatorOpportunityFormatter,
    ),
  );
};
