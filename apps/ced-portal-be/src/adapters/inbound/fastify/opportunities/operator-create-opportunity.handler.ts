import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorCreateOpportunityUseCase } from "../../../../application/use-cases/opportunities/operator-create-opportunity.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  CreateOperatorOpportunityBody,
  GetOperatorOpportunityResponse,
} from "../contracts/opportunities/opportunities.js";

const operatorCreateOpportunityHttpSchema = zod.object({
  body: CreateOperatorOpportunityBody,
});

const operatorCreateOpportunityValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorCreateOpportunityHttpSchema),
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

const operatorCreateOpportunityFormatter = createHttpResponseFormatter(
  GetOperatorOpportunityResponse,
);

export const mountOperatorCreateOpportunityHandler = (
  fastify: FastifyInstance,
  useCase: OperatorCreateOpportunityUseCase,
) => {
  fastify.post(
    "/api/operator/opportunities",
    createHttpHandler(
      useCase,
      operatorCreateOpportunityValidator,
      {
        successCode: 201,
      },
      operatorCreateOpportunityFormatter,
    ),
  );
};
