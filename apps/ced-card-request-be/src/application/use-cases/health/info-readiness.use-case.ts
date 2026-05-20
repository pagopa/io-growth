import type { UseCase } from "@pagopa/io-core-domain";
import type { GenericError } from "@pagopa/io-core-domain/errors";

import { err, ok } from "neverthrow";
import { readFile } from "node:fs/promises";

import type { IHealthCheckRepository } from "../../../domain/ports/outbound/health-check.repository.js";

export interface InfoReadinessOutput {
  readonly name: string;
  readonly ok: boolean;
  readonly version: string;
}

const packageInfo = JSON.parse(
  await readFile(new URL("../../../../package.json", import.meta.url), "utf8"),
) as Pick<InfoReadinessOutput, "name" | "version">;

export type GetInfoReadinessUseCase = UseCase<
  Record<string, never>,
  InfoReadinessOutput,
  GenericError
>;

interface Dependencies {
  readonly persistenceHealthCheckRepository: IHealthCheckRepository;
  readonly sessionStoreHealthCheckRepository: IHealthCheckRepository;
}

export const makeGetInfoReadinessUseCase =
  (deps: Dependencies): GetInfoReadinessUseCase =>
  async () => {
    const persistenceResult =
      await deps.persistenceHealthCheckRepository.checkConnection();
    if (persistenceResult.isErr()) {
      return err(persistenceResult.error);
    }

    const sessionStoreResult =
      await deps.sessionStoreHealthCheckRepository.checkConnection();
    if (sessionStoreResult.isErr()) {
      return err(sessionStoreResult.error);
    }

    return ok({
      name: packageInfo.name,
      ok: true,
      version: packageInfo.version,
    });
  };
