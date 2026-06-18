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
  CompleteOnboardingInput,
  CompleteOnboardingUseCase,
} from "../../../../application/use-cases/department/complete-onboarding.use-case.js";

import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { CompleteOnboardingParams } from "../contracts/department/department.js";

const completeOnboardingHttpSchema = zod.object({
  path: CompleteOnboardingParams,
});

const completeOnboardingInnerValidator: InputValidator<
  FastifyRequest,
  CompleteOnboardingInput
> = async (request) => {
  const pathResult = await createHttpRequestValidator(
    completeOnboardingHttpSchema,
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

const completeOnboardingValidator = withUserTypeAuthorization(
  withSession(
    SessionSchema,
    completeOnboardingInnerValidator,
    (session, input) => ({
      ...input,
      userType: session.userType,
    }),
  ),
);

export const mountCompleteOnboardingHandler = (
  fastify: FastifyInstance,
  useCase: CompleteOnboardingUseCase,
) => {
  fastify.put(
    "/api/department/onboardings/:onboardingId/complete",
    createHttpHandler(useCase, completeOnboardingValidator, {
      successCode: 200,
    }),
  );
};
