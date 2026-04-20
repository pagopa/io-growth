import type { UseCase } from "@pagopa/io-core-domain";
import type { BaseError } from "@pagopa/io-core-domain/errors";

import { ok } from "neverthrow";
import { readFileSync } from "node:fs";

export interface InfoOutput {
  readonly name: string;
  readonly ok: boolean;
  readonly version: string;
}

const packageInfo = JSON.parse(
  readFileSync(new URL("../../../package.json", import.meta.url), "utf8"),
) as Pick<InfoOutput, "name" | "version">;

export const getInfoUseCase: UseCase<
  Record<string, never>,
  InfoOutput,
  BaseError
> = async () =>
  //TODO check for database connection, external services, etc.
  ok({
    name: packageInfo.name,
    ok: true,
    version: packageInfo.version,
  });
