import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorCancelScheduledSuspensionUseCase } from "../../../../application/use-cases/opportunities/operator-cancel-scheduled-suspension.use-case.js";

import { OPERATOR_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { OperatorSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { OperatorCancelScheduledSuspensionParams } from "../contracts/opportunities/opportunities.js";

const operatorCancelScheduledSuspensionHttpSchema = zod.object({
  path: OperatorCancelScheduledSuspensionParams,
});

const operatorCancelScheduledSuspensionValidator = withUserTypeAuthorization(
  OPERATOR_USER_TYPES,
  withSession(
    OperatorSessionSchema,
    createHttpRequestValidator(operatorCancelScheduledSuspensionHttpSchema),
    (session, { path }) => ({
      operatorId: session.operatorId,
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountOperatorCancelScheduledSuspensionHandler = (
  fastify: FastifyInstance,
  useCase: OperatorCancelScheduledSuspensionUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/suspension/cancel",
    createHttpHandler(useCase, operatorCancelScheduledSuspensionValidator, {
      successCode: 204,
    }),
  );
};
