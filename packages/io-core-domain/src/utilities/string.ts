import { createHash } from "node:crypto";

/**
 * Compute the SHA-256 hash of a string (uppercased).
 */
export const hashUppercasedString = (input: string): string =>
  createHash("sha256").update(input.toUpperCase()).digest("hex");
