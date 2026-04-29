import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ok } from "neverthrow";
import { readFile } from "node:fs/promises";

export interface InfoStartupOutput {
  readonly name: string;
  readonly ok: boolean;
  readonly version: string;
}

const packageInfo = JSON.parse(
  await readFile(new URL("../../../../package.json", import.meta.url), "utf8"),
) as Pick<InfoStartupOutput, "name" | "version">;

export const makeGetInfoStartupUseCase: UseCase<
  Record<string, never>,
  InfoStartupOutput,
  BaseError
> = async () =>
  ok({
    name: packageInfo.name,
    ok: true,
    version: packageInfo.version,
  });
