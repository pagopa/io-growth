import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z as zod } from "zod";

import type { AdminGetContractSignedUseCase } from "../../../../application/use-cases/department/admin-get-contract-signed.use-case.js";

import { ADMIN_USER_TYPES } from "../../../../domain/entities/user-type.js";
import { SessionSchema } from "../auth/session.js";
import { withUserTypeAuthorization } from "../auth/utils/authorization.js";
import { GetContractSignedParams } from "../contracts/department/department.js";

const adminGetContractSignedHttpSchema = zod.object({
  path: GetContractSignedParams,
});

const adminGetContractSignedValidator = withUserTypeAuthorization(
  ADMIN_USER_TYPES,
  withSession(
    SessionSchema,
    createHttpRequestValidator(adminGetContractSignedHttpSchema),
    (_session, { path }) => ({
      onboardingId: path.onboardingId,
    }),
  ),
);

export const mountAdminGetContractSignedHandler = (
  fastify: FastifyInstance,
  useCase: AdminGetContractSignedUseCase,
) => {
  fastify.get(
    "/api/department/onboardings/:onboardingId/contract",
    createHttpHandler(useCase, adminGetContractSignedValidator, {
      successCode: 200,
      successReplyHandler: async (reply, blob, successCode) =>
        reply
          .code(successCode)
          .type(blob.type || "application/octet-stream")
          .send(Buffer.from(await blob.arrayBuffer())),
    }),
  );
};
