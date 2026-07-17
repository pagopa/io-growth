import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type {
  CreateDraftInput,
  CreateDraftUseCase,
} from "../../../../application/use-cases/request/create-draft.use-case.js";

import { CardRequestSessionSchema } from "../auth/session.js";
import {
  CreateNewApplicationBody,
  CreateNewApplicationResponse,
} from "../contracts/application-creation/application-creation.js";

// Node/Fastify always lowercases incoming header names, regardless of the
// casing declared in the OpenAPI spec (`Idempotency-Key`). The generated
// `CreateNewApplicationHeader` schema keeps the spec's casing, so headers are
// validated here instead, against the casing Fastify actually delivers.
const createDraftHttpSchema = z.object({
  body: CreateNewApplicationBody,
  headers: z.object({ "idempotency-key": z.uuid() }),
});

const createDraftValidator = withSession(
  CardRequestSessionSchema,
  createHttpRequestValidator(createDraftHttpSchema),
  (session, { body, headers }) => ({
    ...body,
    clientRequestId: headers["idempotency-key"],
    codiceFiscale: session.fiscalCode,
    // The OpenAPI spec declares `idCittadinanza` as a plain integer (no
    // enum), so the generated body schema can't narrow it. The use case's
    // own Zod schema is the actual runtime guardrail for the 0|2|3 domain.
    idCittadinanza: body.idCittadinanza as CreateDraftInput["idCittadinanza"],
  }),
);

const createDraftFormatter = createHttpResponseFormatter(
  CreateNewApplicationResponse,
);

export const mountCreateDraftHandler = (
  fastify: FastifyInstance,
  useCase: CreateDraftUseCase,
) => {
  fastify.post(
    "/api/request",
    createHttpHandler(
      useCase,
      createDraftValidator,
      { successCode: 200 },
      createDraftFormatter,
    ),
  );
};
