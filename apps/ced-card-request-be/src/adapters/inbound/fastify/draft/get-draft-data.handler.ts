import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpResponseFormatter,
  emptyValidator,
  withSession,
} from "@pagopa/io-core-adapter-fastify";

import type { GetDraftDataUseCase } from "../../../../application/use-cases/draft/get-draft-data.use-case.js";

import { CardRequestSessionSchema } from "../auth/session.js";
import { GetDraftDataResponse } from "../contracts/read-only-operations/read-only-operations.js";

const getDraftDataValidator = withSession(
  CardRequestSessionSchema,
  emptyValidator,
  (session) => ({ fiscalCode: session.fiscalCode }),
);

const getDraftDataFormatter = createHttpResponseFormatter(GetDraftDataResponse);

export const mountGetDraftDataHandler = (
  fastify: FastifyInstance,
  useCase: GetDraftDataUseCase,
) => {
  fastify.get(
    "/api/draft",
    createHttpHandler(
      useCase,
      getDraftDataValidator,
      { successCode: 200 },
      getDraftDataFormatter,
    ),
  );
};
