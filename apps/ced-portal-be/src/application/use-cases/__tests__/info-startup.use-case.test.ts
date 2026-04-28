import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";

import { getInfoStartupUseCase } from "../info-startup.use-case.js";

const packageInfo = JSON.parse(
  await readFile(new URL("../../../../package.json", import.meta.url), "utf8"),
) as {
  name: string;
  version: string;
};

describe("getInfoStartupUseCase", () => {
  it("should return the service info from package metadata", async () => {
    const result = await getInfoStartupUseCase({});
    const value = result._unsafeUnwrap();

    expect(value).toEqual({
      name: packageInfo.name,
      ok: true,
      version: packageInfo.version,
    });
  });
});
