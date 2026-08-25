import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { ConfirmApplicationUseCase } from "../../../../application/use-cases/confirm/confirm-application.use-case.js";

import { CardRequestSessionSchema } from "../auth/session.js";
import {
  ConfirmApplicationBody,
  ConfirmApplicationResponse,
} from "../contracts/confirmation-and-documentation/confirmation-and-documentation.js";

// Node/Fastify always lowercases incoming header names, regardless of the
// casing declared in the OpenAPI spec (`Idempotency-Key`). The generated
// `ConfirmApplicationHeader` schema keeps the spec's casing, so headers are
// validated here instead, against the casing Fastify actually delivers.
const confirmApplicationHttpSchema = z.object({
  body: ConfirmApplicationBody,
  headers: z.object({ "idempotency-key": z.uuid() }),
});

const confirmApplicationValidator = withSession(
  CardRequestSessionSchema,
  createHttpRequestValidator(confirmApplicationHttpSchema),
  (session, { body, headers }) => ({
    ...body,
    clientRequestId: headers["idempotency-key"],
    codiceFiscale: session.fiscalCode,
  }),
);

const confirmApplicationFormatter = createHttpResponseFormatter(
  ConfirmApplicationResponse,
);

export const mountConfirmApplicationHandler = (
  fastify: FastifyInstance,
  useCase: ConfirmApplicationUseCase,
) => {
  fastify.post(
    "/api/confirm",
    createHttpHandler(
      useCase,
      confirmApplicationValidator,
      { successCode: 200 },
      confirmApplicationFormatter,
    ),
  );
};
