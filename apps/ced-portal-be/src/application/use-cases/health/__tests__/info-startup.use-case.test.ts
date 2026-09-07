import { ok } from "neverthrow";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { makeInfoStartupUseCase } from "../info-startup.use-case.js";

const packageInfo = JSON.parse(
  readFileSync(new URL("../../../../../package.json", import.meta.url), "utf8"),
) as {
  name: string;
  version: string;
};

describe("makeInfoStartupUseCase", () => {
  it("should return the service info from package metadata", async () => {
    const result = await makeInfoStartupUseCase({});

    expect(result).toEqual(
      ok({
        name: packageInfo.name,
        ok: true,
        version: packageInfo.version,
      }),
    );
  });
});
