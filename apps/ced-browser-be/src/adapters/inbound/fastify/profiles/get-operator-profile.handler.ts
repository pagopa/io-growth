import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { GetOperatorProfileUseCase } from "../../../../application/use-cases/profiles/get-operator-profile.use-case.js";

import { LANGUAGE_VALUES } from "../../../../domain/ports/outbound/persistence/place.repository.js";
import { CitizenSessionSchema } from "../auth/session.js";
import {
  GetOperatorProfileParams,
  GetOperatorProfileResponse,
} from "../contracts/profiles/profiles.js";

const getOperatorProfileHttpSchema = z.object({
  headers: z.object({
    "accept-language": z.enum(LANGUAGE_VALUES).optional(),
  }),
  path: GetOperatorProfileParams,
});

const getOperatorProfileValidator = withSession(
  CitizenSessionSchema,
  createHttpRequestValidator(getOperatorProfileHttpSchema),
  (_session, { headers, path }) => ({
    language: headers["accept-language"],
    profileId: path.profileId,
  }),
);

const getOperatorProfileFormatter = createHttpResponseFormatter(
  GetOperatorProfileResponse,
);

export const mountGetOperatorProfileHandler = (
  fastify: FastifyInstance,
  useCase: GetOperatorProfileUseCase,
) => {
  fastify.get(
    "/api/profiles/:profileId",
    createHttpHandler(
      async (input) => useCase(input),
      getOperatorProfileValidator,
      { successCode: 200 },
      getOperatorProfileFormatter,
    ),
  );
};
