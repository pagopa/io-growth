import type { Express, Request, RequestHandler, Response } from "express";

import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { UseCase } from "../../../../domain/ports/inbound/use-case.js";

import { BaseError } from "../../../../domain/errors/errors.js";
import { mountInfoHandler } from "../info.handler.js";

class TestError extends BaseError {
  override readonly kind = "TestError" as const;
  override readonly tag = "test-error" as const;

  public constructor(message: string) {
    super(message);
  }
}

const makeResponse = (): Response =>
  ({
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  }) as unknown as Response;

const mountHandler = <O, E extends BaseError>(
  useCase: UseCase<Record<string, never>, O, E>,
): RequestHandler => {
  let registeredHandler: RequestHandler | undefined;
  const get = vi.fn((_path: string, handler: RequestHandler) => {
    registeredHandler = handler;
  });
  const app = { get } as unknown as Express;

  mountInfoHandler(app, useCase);

  expect(get).toHaveBeenCalledWith("/api/info", expect.any(Function));

  if (!registeredHandler) {
    throw new Error("Info handler was not registered");
  }

  return registeredHandler;
};

describe("mountInfoHandler", () => {
  it("returns the info payload when the use case succeeds", async () => {
    const handler = mountHandler(async () =>
      ok({
        name: "portal-be",
        ok: true,
        version: "0.0.1",
      }),
    );
    const response = makeResponse();

    await handler({} as Request, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      name: "portal-be",
      ok: true,
      version: "0.0.1",
    });
  });

  it("returns a 500 payload when the use case fails", async () => {
    const handler = mountHandler(async () => err(new TestError("boom")));
    const response = makeResponse();

    await handler({} as Request, response, vi.fn());

    expect(response.status).toHaveBeenCalledWith(500);
    expect(response.json).toHaveBeenCalledWith({
      detail: "boom",
      kind: "TestError",
      tag: "test-error",
    });
  });
});
