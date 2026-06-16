import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { GetOnboardingUseCase } from "../../../../application/use-cases/department/get-onboarding.use-case.js";

import { OnboardingDetailSchema } from "../../../../domain/entities/onboarding.js";
import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { GetOnboardingParams } from "../contracts/department/department.js";

const getOnboardingHttpSchema = zod.object({
  path: GetOnboardingParams,
});

const getOnboardingValidator = withUserTypeAuthorization(
  withSession(
    SessionSchema,
    createHttpRequestValidator(getOnboardingHttpSchema),
    (_session, { path }) => ({
      onboardingId: path.onboardingId,
      userType: _session.userType,
    }),
  ),
);

const getOnboardingFormatter = createHttpResponseFormatter(
  OnboardingDetailSchema,
);

export const mountGetOnboardingHandler = (
  fastify: FastifyInstance,
  useCase: GetOnboardingUseCase,
) => {
  fastify.get(
    "/api/department/onboardings/:onboardingId",
    createHttpHandler(
      useCase,
      getOnboardingValidator,
      { successCode: 200 },
      getOnboardingFormatter,
    ),
  );
};
