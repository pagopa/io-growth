import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import type { IHealthCheckRepository } from "../../../domain/ports/outbound/health-check.repository.js";

import { makeGetInfoReadinessUseCase } from "../info-readiness.use-case.js";

const packageInfo = JSON.parse(
  readFileSync(new URL("../../../../package.json", import.meta.url), "utf8"),
) as {
  name: string;
  version: string;
};

const makeMockHealthCheckRepository = (
  overrides: Partial<IHealthCheckRepository> = {},
): IHealthCheckRepository => ({
  checkConnection: vi.fn().mockResolvedValue(ok(true)),
  ...overrides,
});

describe("makeGetInfoReadinessUseCase", () => {
  it("should return ok with service info when database connection succeeds", async () => {
    const healthCheckRepository = makeMockHealthCheckRepository();
    const useCase = makeGetInfoReadinessUseCase({ healthCheckRepository });

    const result = await useCase({});
    const value = result._unsafeUnwrap();

    expect(value).toEqual({
      name: packageInfo.name,
      ok: true,
      version: packageInfo.version,
    });
    expect(healthCheckRepository.checkConnection).toHaveBeenCalledOnce();
  });

  it("should return err when database connection fails", async () => {
    const healthCheckRepository = makeMockHealthCheckRepository({
      checkConnection: vi
        .fn()
        .mockResolvedValue(err(new GenericError("Connection refused"))),
    });
    const useCase = makeGetInfoReadinessUseCase({ healthCheckRepository });

    const result = await useCase({});
    const error = result._unsafeUnwrapErr();

    expect(error.kind).toBe("GenericError");
    expect(healthCheckRepository.checkConnection).toHaveBeenCalledOnce();
  });
});
