import { describe, expect, it } from "vitest";

import { HttpsUrlSchema } from "../https-url.js";

describe("HttpsUrlSchema", () => {
  it.each(["https://example.org", "https://www.example.org/path?q=1"])(
    "accepts %s",
    (url) => {
      expect(HttpsUrlSchema.safeParse(url).success).toBe(true);
    },
  );

  it.each([
    "http://example.org",
    "https:/example.org",
    "ftp://example.org",
    "www.example.org",
  ])("rejects %s", (url) => {
    expect(HttpsUrlSchema.safeParse(url).success).toBe(false);
  });
});
