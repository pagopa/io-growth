import type { FastifyInstance } from "fastify";

import {
  createHttpHandler,
  createHttpRequestValidator,
  createHttpResponseFormatter,
  withSession,
} from "@pagopa/io-core-adapter-fastify";
import { z } from "zod";

import type { UploadPhotoUseCase } from "../../../../application/use-cases/image/upload-photo.use-case.js";

import { CardRequestSessionSchema } from "../auth/session.js";
import {
  UploadPhotoBody,
  UploadPhotoResponse,
} from "../contracts/photo-upload/photo-upload.js";

// A Base64-encoded ~2 MB photo plus its JSON envelope comfortably exceeds
// Fastify's default 1 MB bodyLimit, so this route needs a higher ceiling.
// Scoped to this route only — every other endpoint keeps the safe default.
const UPLOAD_PHOTO_BODY_LIMIT_BYTES = 3 * 1024 * 1024;

// Node/Fastify always lowercases incoming header names, regardless of the
// casing declared in the OpenAPI spec (`Idempotency-Key`). The generated
// `UploadPhotoHeader` schema keeps the spec's casing, so headers are
// validated here instead, against the casing Fastify actually delivers.
const uploadPhotoHttpSchema = z.object({
  body: UploadPhotoBody,
  headers: z.object({ "idempotency-key": z.uuid() }),
});

const uploadPhotoValidator = withSession(
  CardRequestSessionSchema,
  createHttpRequestValidator(uploadPhotoHttpSchema),
  (session, { body, headers }) => ({
    ...body,
    clientRequestId: headers["idempotency-key"],
    codiceFiscale: session.fiscalCode,
  }),
);

const uploadPhotoFormatter = createHttpResponseFormatter(UploadPhotoResponse);

export const mountUploadPhotoHandler = (
  fastify: FastifyInstance,
  useCase: UploadPhotoUseCase,
) => {
  fastify.post(
    "/api/image",
    { bodyLimit: UPLOAD_PHOTO_BODY_LIMIT_BYTES },
    createHttpHandler(
      useCase,
      uploadPhotoValidator,
      { successCode: 200 },
      uploadPhotoFormatter,
    ),
  );
};
