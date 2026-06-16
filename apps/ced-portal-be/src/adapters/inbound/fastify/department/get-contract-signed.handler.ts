import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { GetContractSignedUseCase } from "../../../../application/use-cases/department/get-contract-signed.use-case.js";

import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { GetContractSignedParams } from "../contracts/department/department.js";

const getContractSignedHttpSchema = zod.object({
  path: GetContractSignedParams,
});

const getContractSignedValidator = withUserTypeAuthorization(
  withSession(
    SessionSchema,
    createHttpRequestValidator(getContractSignedHttpSchema),
    (_session, { path }) => ({
      onboardingId: path.onboardingId,
      userType: _session.userType,
    }),
  ),
);

export const mountGetContractSignedHandler = (
  fastify: FastifyInstance,
  useCase: GetContractSignedUseCase,
) => {
  fastify.get(
    "/api/department/onboardings/:onboardingId/contract",
    createHttpHandler(useCase, getContractSignedValidator, {
      successCode: 200,
      successReplyHandler: async (reply, blob, successCode) =>
        reply
          .code(successCode)
          .type(blob.type || "application/octet-stream")
          .send(Buffer.from(await blob.arrayBuffer())),
    }),
  );
};
