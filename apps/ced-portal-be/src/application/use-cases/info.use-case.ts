import { ok } from "neverthrow";

import type { BaseError } from "../../domain/errors/errors.js";
import type { UseCase } from "../../domain/ports/inbound/use-case.js";

export interface InfoOutput {
  readonly name: string;
  readonly ok: boolean;
  readonly version: string;
}

export const getInfoUseCase: UseCase<
  Record<string, never>,
  InfoOutput,
  BaseError
> = async () =>
  ok({
    name: "portal-be",
    ok: true,
    version: "0.0.1",
  });
