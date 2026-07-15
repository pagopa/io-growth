import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { OperatorCancelScheduledSuspensionUseCase } from "../../../../application/use-cases/opportunities/operator-cancel-scheduled-suspension.use-case.js";

import { OperatorSessionSchema } from "../auth/session.js";
import { OperatorCancelScheduledSuspensionParams } from "../contracts/opportunities/opportunities.js";

const operatorCancelScheduledSuspensionHttpSchema = zod.object({
  path: OperatorCancelScheduledSuspensionParams,
});

const operatorCancelScheduledSuspensionValidator = withSession(
  OperatorSessionSchema,
  createHttpRequestValidator(operatorCancelScheduledSuspensionHttpSchema),
  (session, { path }) => ({
    operatorId: session.operatorId,
    opportunityId: path.opportunityId,
  }),
);

export const mountOperatorCancelScheduledSuspensionHandler = (
  fastify: FastifyInstance,
  useCase: OperatorCancelScheduledSuspensionUseCase,
) => {
  fastify.patch(
    "/api/operator/opportunities/:opportunityId/suspend/cancel",
    createHttpHandler(useCase, operatorCancelScheduledSuspensionValidator, {
      successCode: 204,
    }),
  );
};
