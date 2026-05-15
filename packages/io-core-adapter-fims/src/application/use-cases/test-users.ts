import { createHash } from "node:crypto";

/**
 * Compute the SHA-256 hash of a fiscal code (uppercased).
 * Used to match against the `TEST_USERS` env var which stores hashed fiscal codes.
 */
export const hashFiscalCode = (fiscalCode: string): string =>
  createHash("sha256").update(fiscalCode.toUpperCase()).digest("hex");

/**
 * Check whether a fiscal code belongs to the test user list.
 * `testUsers` is an array of SHA-256 hex strings (from the `TEST_USERS` env var).
 */
export const isTestUser = (
  testUsers: readonly string[],
  fiscalCode: string,
): boolean => testUsers.includes(hashFiscalCode(fiscalCode));
