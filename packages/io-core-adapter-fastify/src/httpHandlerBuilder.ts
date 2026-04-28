import type { InputValidator, UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyReply, FastifyRequest } from "fastify";

import { sendErrorResponse } from "./errorMapper.js";

export type HttpHandlerOptions<O = unknown> =
  | {
      redirect: true;
      redirectCode?: 301 | 302 | 303 | 307 | 308;
      redirectUrlBuilder?: (output: O) => string;
    }
  | {
      redirect?: false;
      successCode: 200 | 201 | 202 | 204;
    };

export const createHttpHandler =
  <TUseCaseInput extends object, O, E extends BaseError>(
    useCase: UseCase<TUseCaseInput, O, E>,
    inputValidator: InputValidator<FastifyRequest, TUseCaseInput>,
    options: HttpHandlerOptions<O> = { successCode: 200 },
  ) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    // Validate input using the provided input validator
    const inputResult = await inputValidator(request);

    if (inputResult.isErr()) {
      return sendErrorResponse(reply, inputResult.error);
    }

    // Call the use case with the validated input
    const result = await useCase(inputResult.value);

    // Handle the result of the use case
    if (result.isErr()) {
      return sendErrorResponse(reply, result.error);
    }

    if (options.redirect) {
      const url = options.redirectUrlBuilder
        ? options.redirectUrlBuilder(result.value)
        : (result.value as { url: string }).url;
      return reply.redirect(url, options.redirectCode ?? 302);
    }

    // TODO-1: Add support for security headers and other common response headers
    // TODO-2: Add support for different success codes and response bodies
    return reply.code(options.successCode).send(result.value);
  };
