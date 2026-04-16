import type { StandardSchemaV1 } from "@standard-schema/spec";
import type { Request } from "express";

import { err, ok } from "neverthrow";

import { ValidationError } from "../../../../domain/errors/errors.js";
import { InputValidator } from "../../../../domain/ports/inbound/inputValidator.js";

export interface HttpRequestPayload {
  body?: unknown;
  headers?: unknown;
  path?: unknown;
  query?: unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RestrictToPayloadKeys<T extends StandardSchemaV1<any, any>> =
  Exclude<keyof SchemaInput<T>, keyof HttpRequestPayload> extends never
    ? unknown
    : "ERROR_TS:schema contains invalid parameters (use only body, headers, path or query)";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SchemaInput<T extends StandardSchemaV1<any, any>> =
  StandardSchemaV1.InferInput<T>;

/**
 *
 * @param schema
 * @returns
 */
export const createHttpRequestValidator =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  <T extends StandardSchemaV1<any, any>>(
      schema: RestrictToPayloadKeys<T> & T,
    ): InputValidator<Request, StandardSchemaV1.InferOutput<T>> =>
    async (request: Request) => {
      const inputForSchemaValidator: HttpRequestPayload = {
        body: request.body ?? {},
        headers: request.headers,
        path: request.params,
        query: request.query,
      };

      const result = await schema["~standard"].validate(
        inputForSchemaValidator,
      );

      if (result.issues) {
        return err(validationErrorFromStandardIssues(result.issues));
      }

      return ok(result.value);
    };

export const validationErrorFromStandardIssues = (
  input: readonly StandardSchemaV1.Issue[],
): ValidationError => new ValidationError(formatStandardIssues(input));

/**
 * Converts the array of Standard Schema errors into a single formatted string.
 */
const formatStandardIssues = (
  issues: readonly StandardSchemaV1.Issue[],
): string =>
  issues
    .map((issue) => {
      // If there's a path, join the keys (e.g., "body.id")
      const pathString = issue.path ? issue.path.join(".") : "root";

      return `[${pathString}]: ${issue.message}`;
    })
    .join(", ");

/**
 *
 * @returns
 */
export const emptyValidator: InputValidator<
  Request,
  Record<string, never>
> = async () => ok({});
