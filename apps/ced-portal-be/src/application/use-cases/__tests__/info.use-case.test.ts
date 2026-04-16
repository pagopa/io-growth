import { describe, expect, it } from "vitest";

import { getInfoUseCase } from "../info.use-case.js";

describe("getInfoUseCase", () => {
  it("returns the application health payload", async () => {
    const result = await getInfoUseCase({});

    expect(result.isOk()).toBe(true);

    if (result.isErr()) {
      throw new Error("Expected getInfoUseCase to succeed");
    }

    expect(result.value).toEqual({
      name: "portal-be",
      ok: true,
      version: "0.0.1",
    });
  });
});
