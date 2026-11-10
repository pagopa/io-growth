import { describe, expect, it } from "vitest";

import { normalizeTrailingAccents } from "../inps-card-application.mapper.js";

describe("normalizeTrailingAccents", () => {
  it.each([
    ["à", "a'"],
    ["á", "a'"],
    ["â", "a'"],
    ["ä", "a'"],
    ["ã", "a'"],
    ["å", "a'"],
    ["è", "e'"],
    ["é", "e'"],
    ["ê", "e'"],
    ["ë", "e'"],
    ["ì", "i'"],
    ["í", "i'"],
    ["î", "i'"],
    ["ï", "i'"],
    ["ò", "o'"],
    ["ó", "o'"],
    ["ô", "o'"],
    ["ö", "o'"],
    ["õ", "o'"],
    ["ù", "u'"],
    ["ú", "u'"],
    ["û", "u'"],
    ["ü", "u'"],
    ["À", "A'"],
    ["É", "E'"],
    ["Ì", "I'"],
    ["Ò", "O'"],
    ["Ù", "U'"],
  ])("rewrites a trailing %s as %s", (accented, expected) => {
    expect(normalizeTrailingAccents(`Mar${accented}`)).toBe(`Mar${expected}`);
  });

  it("handles precomposed and decomposed input alike", () => {
    expect(normalizeTrailingAccents("Niccolo\u0300")).toBe("Niccolo'");
    expect(normalizeTrailingAccents("Niccol\u00f2")).toBe("Niccolo'");
  });

  it("rewrites the last character of every word", () => {
    expect(normalizeTrailingAccents("Perù Niccolò")).toBe("Peru' Niccolo'");
  });

  it("leaves interior accents, non-vowel accents and plain endings untouched", () => {
    expect(normalizeTrailingAccents("Àlvaro")).toBe("Àlvaro");
    expect(normalizeTrailingAccents("Françoise")).toBe("Françoise");
    expect(normalizeTrailingAccents("François")).toBe("François");
    expect(normalizeTrailingAccents("Rossi")).toBe("Rossi");
  });
});
