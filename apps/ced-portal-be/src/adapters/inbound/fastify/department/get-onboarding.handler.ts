import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { GetOnboardingUseCase } from "../../../../application/use-cases/department/get-onboarding.use-case.js";

import { OnboardingSchema } from "../../../../domain/entities/onboarding.js";
import { SessionSchema } from "../auth/session.js";
import { GetOnboardingParams } from "../contracts/department/department.js";

const getOnboardingHttpSchema = zod.object({
  path: GetOnboardingParams,
});

const getOnboardingValidator = withSession(
  SessionSchema,
  createHttpRequestValidator(getOnboardingHttpSchema),
  (_session, { path }) => ({
    onboardingId: path.onboardingId,
  }),
);

const getOnboardingFormatter = createHttpResponseFormatter(OnboardingSchema);

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
