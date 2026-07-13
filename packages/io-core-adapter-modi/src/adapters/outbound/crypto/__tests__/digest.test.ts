import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";

import { computeDigest } from "../digest.js";

describe("computeDigest", () => {
  it("produces SHA-256=<base64> format", () => {
    const result = computeDigest("hello");
    expect(result).toMatch(/^SHA-256=[A-Za-z0-9+/]+=*$/);
  });

  it("matches manual SHA-256 base64 computation", () => {
    const body = JSON.stringify({ codiceFiscale: "RSSMRA80A01H501U" });
    const expected = `SHA-256=${createHash("sha256").update(body).digest("base64")}`;
    expect(computeDigest(body)).toBe(expected);
  });

  it("is deterministic for the same input", () => {
    const body = "same body";
    expect(computeDigest(body)).toBe(computeDigest(body));
  });

  it("produces different digests for different inputs", () => {
    expect(computeDigest("a")).not.toBe(computeDigest("b"));
  });

  it("handles empty string body", () => {
    const result = computeDigest("");
    // SHA-256 of empty string is 47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=
    expect(result).toBe("SHA-256=47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU=");
  });

  it("handles Buffer input", () => {
    const body = Buffer.from("hello");
    const result = computeDigest(body);
    expect(result).toBe(computeDigest("hello"));
  });

  it("handles Uint8Array input", () => {
    const body = new TextEncoder().encode("hello");
    const result = computeDigest(body);
    expect(result).toBe(computeDigest("hello"));
  });
});
