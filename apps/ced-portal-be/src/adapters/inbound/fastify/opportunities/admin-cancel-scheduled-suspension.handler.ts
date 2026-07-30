import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminCancelScheduledSuspensionUseCase } from "../../../../application/use-cases/opportunities/admin-cancel-scheduled-suspension.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { CancelScheduledSuspensionParams } from "../contracts/opportunities/opportunities.js";

const adminCancelScheduledSuspensionHttpSchema = zod.object({
  path: CancelScheduledSuspensionParams,
});

const adminCancelScheduledSuspensionValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminCancelScheduledSuspensionHttpSchema),
    (_session, { path }) => ({
      opportunityId: path.opportunityId,
    }),
  ),
);

export const mountAdminCancelScheduledSuspensionHandler = (
  fastify: FastifyInstance,
  useCase: AdminCancelScheduledSuspensionUseCase,
) => {
  fastify.patch(
    "/api/opportunities/:opportunityId/suspension/cancel",
    createHttpHandler(useCase, adminCancelScheduledSuspensionValidator, {
      successCode: 204,
    }),
  );
};
