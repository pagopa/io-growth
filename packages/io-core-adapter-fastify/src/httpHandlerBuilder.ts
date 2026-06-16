import type {
  InputValidator,
  OutputFormatter,
  UseCase,
} from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";
import type { FastifyReply, FastifyRequest } from "fastify";

import { sendErrorResponse } from "./errorMapper.js";

export type HttpHandlerOptions<O = unknown, R = O> =
  | {
      redirect: true;
      redirectCode?: 301 | 302 | 303 | 307 | 308;
      redirectUrlBuilder?: (output: O) => string;
    }
  | {
      redirect?: false;
      successCode: HttpSuccessCode;
      successReplyHandler?: HttpSuccessReplyHandler<R>;
    };

export type HttpSuccessCode = 200 | 201 | 202 | 204;

export type HttpSuccessReplyHandler<R = unknown> = (
  reply: FastifyReply,
  output: R,
  successCode: HttpSuccessCode,
) => Promise<unknown> | unknown;

export const createHttpHandler =
  <TUseCaseInput extends object, O, E extends BaseError, R = O>(
    useCase: UseCase<TUseCaseInput, O, E>,
    inputValidator: InputValidator<FastifyRequest, TUseCaseInput>,
    options: HttpHandlerOptions<O, R> = { successCode: 200 },
    outputFormatter?: OutputFormatter<O, R>,
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

    let output: R;

    if (outputFormatter) {
      const formatted = await outputFormatter(result.value);

      if (formatted.isErr()) {
        return sendErrorResponse(reply, formatted.error);
      }

      output = formatted.value;
    } else {
      output = result.value as unknown as R;
    }

    if (options.successReplyHandler) {
      return options.successReplyHandler(reply, output, options.successCode);
    }

    return reply.code(options.successCode).send(output);
  };
