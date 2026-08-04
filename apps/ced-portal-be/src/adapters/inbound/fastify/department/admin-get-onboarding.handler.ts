import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminGetOnboardingUseCase } from "../../../../application/use-cases/department/admin-get-onboarding.use-case.js";

import { OnboardingDetailSchema } from "../../../../domain/entities/onboarding.js";
import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { GetOnboardingParams } from "../contracts/department/department.js";

const adminGetOnboardingHttpSchema = zod.object({
  path: GetOnboardingParams,
});

const adminGetOnboardingValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    SessionSchema,
    createHttpRequestValidator(adminGetOnboardingHttpSchema),
    (_session, { path }) => ({
      onboardingId: path.onboardingId,
    }),
  ),
);

const adminGetOnboardingFormatter = createHttpResponseFormatter(
  OnboardingDetailSchema,
);

export const mountAdminGetOnboardingHandler = (
  fastify: FastifyInstance,
  useCase: AdminGetOnboardingUseCase,
) => {
  fastify.get(
    "/api/department/onboardings/:onboardingId",
    createHttpHandler(
      useCase,
      adminGetOnboardingValidator,
      { successCode: 200 },
      adminGetOnboardingFormatter,
    ),
  );
};
