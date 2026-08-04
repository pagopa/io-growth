import type { InputValidator } from "@pagopa/io-core-domain";
import type { FastifyInstance, FastifyRequest } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { z as zod } from "zod";

import type {
  AdminCompleteOnboardingInput,
  AdminCompleteOnboardingUseCase,
} from "../../../../application/use-cases/department/admin-complete-onboarding.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { CompleteOnboardingParams } from "../contracts/department/department.js";

const adminCompleteOnboardingHttpSchema = zod.object({
  path: CompleteOnboardingParams,
});

const completeOnboardingInnerValidator: InputValidator<
  FastifyRequest,
  AdminCompleteOnboardingInput
> = async (request) => {
  const pathResult = await createHttpRequestValidator(
    adminCompleteOnboardingHttpSchema,
  )(request);

  if (pathResult.isErr()) {
    return err(pathResult.error);
  }

  const file = await request.file();

  if (!file || file.fieldname !== "contract") {
    return err(new ValidationError("Missing required file field: contract"));
  }

  const buffer = await file.toBuffer();

  return ok({
    contract: new Blob([buffer], { type: file.mimetype }),
    onboardingId: pathResult.value.path.onboardingId,
  });
};

const adminCompleteOnboardingValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    SessionSchema,
    completeOnboardingInnerValidator,
    (_session, input) => input,
  ),
);

export const mountAdminCompleteOnboardingHandler = (
  fastify: FastifyInstance,
  useCase: AdminCompleteOnboardingUseCase,
) => {
  fastify.put(
    "/api/department/onboardings/:onboardingId/complete",
    createHttpHandler(useCase, adminCompleteOnboardingValidator, {
      successCode: 200,
    }),
  );
};
