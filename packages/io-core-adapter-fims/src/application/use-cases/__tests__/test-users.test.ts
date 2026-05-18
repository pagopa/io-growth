import { describe, expect, it } from "vitest";

import { hashFiscalCode, isTestUser } from "../test-users.js";

describe("hashFiscalCode", () => {
  it("should return a lowercase hex sha256 digest", () => {
    const result = hashFiscalCode("RSSMRA80A01H501U");
    expect(result).toMatch(/^[0-9a-f]{64}$/);
  });

  it("should normalise to uppercase before hashing", () => {
    expect(hashFiscalCode("rssmra80a01h501u")).toBe(
      hashFiscalCode("RSSMRA80A01H501U"),
    );
  });
});

describe("isTestUser", () => {
  it("should return true when the hashed fiscal code is in the list", () => {
    const fiscalCode = "RSSMRA80A01H501U";
    const testUsers = [hashFiscalCode(fiscalCode)];
    expect(isTestUser(testUsers, fiscalCode)).toBe(true);
  });

  it("should return true regardless of input casing", () => {
    const fiscalCode = "RSSMRA80A01H501U";
    const testUsers = [hashFiscalCode(fiscalCode)];
    expect(isTestUser(testUsers, fiscalCode.toLowerCase())).toBe(true);
  });

  it("should return false when the hashed fiscal code is NOT in the list", () => {
    const testUsers = [hashFiscalCode("RSSMRA80A01H501U")];
    expect(isTestUser(testUsers, "GLLGLL80A01H501V")).toBe(false);
  });

  it("should return false for an empty list", () => {
    expect(isTestUser([], "RSSMRA80A01H501U")).toBe(false);
  });
});
