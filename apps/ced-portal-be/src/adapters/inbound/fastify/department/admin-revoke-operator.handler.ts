import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminRevokeOperatorUseCase } from "../../../../application/use-cases/department/admin-revoke-operator.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { UserTypeSessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  AdminRevokeOperatorBody,
  AdminRevokeOperatorParams,
} from "../contracts/department/department.js";

const adminRevokeOperatorHttpSchema = zod.object({
  body: AdminRevokeOperatorBody,
  path: AdminRevokeOperatorParams,
});

const adminRevokeOperatorValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    UserTypeSessionSchema,
    createHttpRequestValidator(adminRevokeOperatorHttpSchema),
    (_session, { body, path }) => ({
      onboardingId: path.onboardingId,
      revocationMessage: body.revocationMessage,
    }),
  ),
);

export const mountAdminRevokeOperatorHandler = (
  fastify: FastifyInstance,
  useCase: AdminRevokeOperatorUseCase,
) => {
  fastify.patch(
    "/api/department/onboardings/:onboardingId/revoke",
    createHttpHandler(useCase, adminRevokeOperatorValidator, {
      successCode: 204,
    }),
  );
};
