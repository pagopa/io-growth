import type { InputValidator } from "@pagopa/io-core-domain";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { createHttpHandler } from "@pagopa/io-core-adapter-fastify";
import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type {
  CompleteOnboardingInput,
  CompleteOnboardingUseCase,
} from "../../../../application/use-cases/department/complete-onboarding.use-case.js";

import { CompleteOnboardingParams } from "../contracts/department/department.js";

const completeOnboardingValidator: InputValidator<
  FastifyRequest,
  CompleteOnboardingInput
> = async (request) => {
  const paramsResult = CompleteOnboardingParams.safeParse(request.params);

  if (!paramsResult.success) {
    return err(new ValidationError(paramsResult.error.message));
  }

  const file = await request.file();

  if (!file || file.fieldname !== "contract") {
    return err(new ValidationError("Missing required file field: contract"));
  }

  const buffer = await file.toBuffer();

  return ok({
    contract: new Blob([buffer], { type: file.mimetype }),
    onboardingId: paramsResult.data.onboardingId,
  });
};

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
