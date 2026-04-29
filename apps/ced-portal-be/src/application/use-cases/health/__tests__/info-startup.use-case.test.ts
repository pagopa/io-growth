import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import { makeGetInfoStartupUseCase } from "../info-startup.use-case.js";

const packageInfo = JSON.parse(
  readFileSync(new URL("../../../../../package.json", import.meta.url), "utf8"),
) as {
  name: string;
  version: string;
};

describe("makeGetInfoStartupUseCase", () => {
  it("should return the service info from package metadata", async () => {
    const result = await makeGetInfoStartupUseCase({});
    const value = result._unsafeUnwrap();

    expect(value).toEqual({
      name: packageInfo.name,
      ok: true,
      version: packageInfo.version,
    });
  });
});
