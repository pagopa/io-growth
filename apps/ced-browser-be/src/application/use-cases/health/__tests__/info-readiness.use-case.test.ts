import { GenericError, ServiceUnavailableError } from "@pagopa/io-core-domain";
import { err, ok } from "neverthrow";
import { readFileSync } from "node:fs";
import { describe, expect } from "vitest";
import { it, vi } from "vitest";

import type { IHealthCheckRepository } from "../../../../domain/ports/outbound/health-check.repository.js";

import { makeGetInfoReadinessUseCase } from "../info-readiness.use-case.js";
const packageInfo = JSON.parse(
  readFileSync(
    new URL("../../../../../package.json", import.meta.url),
    "utf-8",
  ),
) as { name: string; version: string };

const makeMockHealthCheckRepository = (
  overrides: Partial<IHealthCheckRepository> = {},
): IHealthCheckRepository => ({
  checkConnection: vi.fn().mockResolvedValue(ok(true)),
  ...overrides,
});

describe("makeInfoReadinessUseCase", () => {
  it("should return ok with service info when all connections succeed", async () => {
    const persistenceHealthCheckRepository = makeMockHealthCheckRepository();
    const sessionStoreHealthCheckRepository = makeMockHealthCheckRepository();

    const useCase = makeGetInfoReadinessUseCase({
      persistenceHealthCheckRepository,
      sessionStoreHealthCheckRepository,
    });
    const result = await useCase({});

    expect(result).toEqual(
      ok({
        name: packageInfo.name,
        ok: true,
        version: packageInfo.version,
      }),
    );
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
        .mockResolvedValueOnce(err(new GenericError("Connection Refused"))),
    });
    const sessionStoreHealthCheckRepository = makeMockHealthCheckRepository();
    const useCase = makeGetInfoReadinessUseCase({
      persistenceHealthCheckRepository,
      sessionStoreHealthCheckRepository,
    });

    const result = await useCase({});

    expect(result).toEqual(
      err(
        new ServiceUnavailableError(
          new GenericError("Connection Refused").message,
        ),
      ),
    );
    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ServiceUnavailableError" })),
    );
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
        .mockResolvedValueOnce(err(new GenericError("Redis PING failed"))),
    });
    const useCase = makeGetInfoReadinessUseCase({
      persistenceHealthCheckRepository,
      sessionStoreHealthCheckRepository,
    });

    const result = await useCase({});

    expect(result).toEqual(
      err(
        new ServiceUnavailableError(
          new GenericError("Redis PING failed").message,
        ),
      ),
    );
    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ServiceUnavailableError" })),
    );
    expect(
      persistenceHealthCheckRepository.checkConnection,
    ).toHaveBeenCalledOnce();
    expect(
      sessionStoreHealthCheckRepository.checkConnection,
    ).toHaveBeenCalledOnce();
  });
});
