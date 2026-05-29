import type { FastifyInstance, FastifyRequest } from "fastify";

import { sendErrorResponse } from "@pagopa/io-core-adapter-fastify";
import { ValidationError } from "@pagopa/io-core-domain/errors";

import type { GetContractSignedUseCase } from "../../../../application/use-cases/department/get-contract-signed.use-case.js";

import { GetContractSignedParams } from "../contracts/department/department.js";

export const mountGetContractSignedHandler = (
  fastify: FastifyInstance,
  useCase: GetContractSignedUseCase,
) => {
  fastify.get(
    "/api/department/onboardings/:onboardingId/contract",
    async (request: FastifyRequest, reply) => {
      const paramsResult = GetContractSignedParams.safeParse(request.params);

      if (!paramsResult.success) {
        return sendErrorResponse(
          reply,
          new ValidationError(paramsResult.error.message),
        );
      }

      const result = await useCase({
        onboardingId: paramsResult.data.onboardingId,
      });

      if (result.isErr()) {
        return sendErrorResponse(reply, result.error);
      }

      const blob = result.value;

      return reply
        .type(blob.type || "application/octet-stream")
        .send(Buffer.from(await blob.arrayBuffer()));
    },
  );
};
