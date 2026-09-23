import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminRejectOnboardingUseCase } from "../../../../application/use-cases/department/admin-reject-onboarding.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import {
  AdminRejectOnboardingBody,
  AdminRejectOnboardingParams,
} from "../contracts/department/department.js";

const adminRejectOnboardingHttpSchema = zod.object({
  body: AdminRejectOnboardingBody,
  path: AdminRejectOnboardingParams,
});

const adminRejectOnboardingValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    SessionSchema,
    createHttpRequestValidator(adminRejectOnboardingHttpSchema),
    (session, { body, path }) => ({
      onboardingId: path.onboardingId,
      referentExternalId: session.referentExternalId,
      rejectionMessage: body.rejectionMessage,
    }),
  ),
);

export const mountAdminRejectOnboardingHandler = (
  fastify: FastifyInstance,
  useCase: AdminRejectOnboardingUseCase,
) => {
  fastify.patch(
    "/api/department/onboardings/:onboardingId/reject",
    createHttpHandler(useCase, adminRejectOnboardingValidator, {
      successCode: 204,
    }),
  );
};
