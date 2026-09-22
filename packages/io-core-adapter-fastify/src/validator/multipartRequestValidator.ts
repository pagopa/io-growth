import type { InputValidator } from "@pagopa/io-core-domain";
import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { FastifyRequest } from "fastify";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import { validationErrorFromStandardIssues } from "./httpInputStandardSchemaValidator.js";

/**
 * Builds an `InputValidator` for `multipart/form-data` requests.
 *
 * Every part is collected into a plain object keyed by field name — file parts
 * become `File` instances, and `application/json` parts are parsed by
 * `@fastify/multipart` (including JSON Blobs sent with a filename) — and then
 * validated with the given schema, so handlers can reuse the OpenAPI-generated
 * multipart body schema as-is.
 *
 * @param schema - A StandardSchema (e.g. Zod) describing the multipart body
 */
export const createMultipartRequestValidator =
  <T extends StandardSchemaV1<unknown, unknown>>(
    schema: T,
  ): InputValidator<FastifyRequest, StandardSchemaV1.InferOutput<T>> =>
  async (request: FastifyRequest) => {
    if (!request.isMultipart()) {
      return err(new ValidationError("Expected a multipart/form-data request"));
    }

    // Null-prototype object: field names come from the request.
    const body: Record<string, unknown> = Object.create(null);

    try {
      for await (const part of request.parts()) {
        if (part.type !== "file") {
          body[part.fieldname] = part.value;
          continue;
        }

        const content = await part.toBuffer();
        body[part.fieldname] =
          part.mimetype === "application/json"
            ? JSON.parse(content.toString("utf8"))
            : new File([content], part.filename, {
                type: part.mimetype,
              });
      }
    } catch (error) {
      return err(
        new ValidationError(
          `Invalid multipart request: ${error instanceof Error ? error.message : String(error)}`,
        ),
      );
    }

    const result = await schema["~standard"].validate(body);

    return result.issues
      ? err(validationErrorFromStandardIssues(result.issues))
      : ok(result.value);
  };
