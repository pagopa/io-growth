import { describe, expect, it } from "vitest";

import { escapeIlikePattern } from "../escape-ilike-pattern.js";

describe("escapeIlikePattern", () => {
  it.each([
    ["Sportello", "Sportello"],
    ["", ""],
    ["50%_off", "50\\%\\_off"],
    ["folder\\name", "folder\\\\name"],
    ["\\%_", "\\\\\\%\\_"],
  ])("escapes %j as %j", (input, expected) => {
    expect(escapeIlikePattern(input)).toBe(expected);
  });
});
