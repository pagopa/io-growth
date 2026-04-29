import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

import type { IHealthCheckRepository } from "../../../../domain/ports/outbound/health-check.repository.js";

import { makeGetInfoReadinessUseCase } from "../info-readiness.use-case.js";

const packageInfo = JSON.parse(
  readFileSync(new URL("../../../../../package.json", import.meta.url), "utf8"),
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
  it("should return ok with service info when all connections succeed", async () => {
    const persistenceHealthCheckRepository = makeMockHealthCheckRepository();
    const sessionStoreHealthCheckRepository = makeMockHealthCheckRepository();
    const useCase = makeGetInfoReadinessUseCase({
      persistenceHealthCheckRepository,
      sessionStoreHealthCheckRepository,
    });

    const result = await useCase({});
    const value = result._unsafeUnwrap();

    expect(value).toEqual({
      name: packageInfo.name,
      ok: true,
      version: packageInfo.version,
    });
    expect(
      persistenceHealthCheckRepository.checkConnection,
    ).toHaveBeenCalledOnce();
    expect(
      sessionStoreHealthCheckRepository.checkConnection,
    ).toHaveBeenCalledOnce();
  });

  it("should return err when persistence connection fails", async () => {
    const persistenceHealthCheckRepository = makeMockHealthCheckRepository({
      checkConnection: vi
        .fn()
        .mockResolvedValue(err(new GenericError("Connection refused"))),
    });
    const sessionStoreHealthCheckRepository = makeMockHealthCheckRepository();
    const useCase = makeGetInfoReadinessUseCase({
      persistenceHealthCheckRepository,
      sessionStoreHealthCheckRepository,
    });

    const result = await useCase({});
    const error = result._unsafeUnwrapErr();

    expect(error.kind).toBe("GenericError");
    expect(
      persistenceHealthCheckRepository.checkConnection,
    ).toHaveBeenCalledOnce();
    expect(
      sessionStoreHealthCheckRepository.checkConnection,
    ).not.toHaveBeenCalled();
  });

  it("should return err when session store connection fails", async () => {
    const persistenceHealthCheckRepository = makeMockHealthCheckRepository();
    const sessionStoreHealthCheckRepository = makeMockHealthCheckRepository({
      checkConnection: vi
        .fn()
        .mockResolvedValue(err(new GenericError("Redis PING failed"))),
    });
    const useCase = makeGetInfoReadinessUseCase({
      persistenceHealthCheckRepository,
      sessionStoreHealthCheckRepository,
    });

    const result = await useCase({});
    const error = result._unsafeUnwrapErr();

    expect(error.kind).toBe("GenericError");
    expect(
      persistenceHealthCheckRepository.checkConnection,
    ).toHaveBeenCalledOnce();
    expect(
      sessionStoreHealthCheckRepository.checkConnection,
    ).toHaveBeenCalledOnce();
  });
});
