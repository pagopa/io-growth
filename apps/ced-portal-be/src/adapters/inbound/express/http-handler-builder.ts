import type { Request, RequestHandler, Response } from "express";
import type { Result } from "neverthrow";

import { ok } from "neverthrow";

import type { BaseError } from "../../../domain/errors/errors.js";
import type { UseCase } from "../../../domain/ports/inbound/use-case.js";

type InputValidator<TTransportInput, TUseCaseInput extends object> = (
  input: TTransportInput,
) => Promise<Result<TUseCaseInput, BaseError>>;

const sendErrorResponse = (response: Response, error: BaseError): void => {
  response.status(500).json({
    detail: error.message,
    kind: error.kind,
    tag: error.tag,
  });
};

export const createHttpHandler =
  <TUseCaseInput extends object, O, E extends BaseError>(
    useCase: UseCase<TUseCaseInput, O, E>,
    inputValidator: InputValidator<Request, TUseCaseInput>,
  ): RequestHandler =>
  async (request, response) => {
    const inputResult = await inputValidator(request);

    if (inputResult.isErr()) {
      sendErrorResponse(response, inputResult.error);
      return;
    }

    const result = await useCase(inputResult.value);

    if (result.isErr()) {
      sendErrorResponse(response, result.error);
      return;
    }

    response.status(200).json(result.value);
  };

export const emptyValidator: InputValidator<
  Request,
  Record<string, never>
> = async () => ok({});
