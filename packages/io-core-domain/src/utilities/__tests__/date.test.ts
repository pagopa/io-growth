import { afterEach, describe, expect, it, vi } from "vitest";

import { getApplicationDate } from "../date.js";

afterEach(() => {
  vi.useRealTimers();
});

describe("getApplicationDate", () => {
  it.each([
    ["2026-07-14T21:59:59Z", "2026-07-14"],
    ["2026-07-14T22:00:00Z", "2026-07-15"],
    ["2026-01-14T22:59:59Z", "2026-01-14"],
    ["2026-01-14T23:00:00Z", "2026-01-15"],
    ["2026-03-28T23:00:00Z", "2026-03-29"],
    ["2026-03-29T22:00:00Z", "2026-03-30"],
    ["2026-10-24T22:00:00Z", "2026-10-25"],
    ["2026-10-25T23:00:00Z", "2026-10-26"],
    ["2026-12-31T23:00:00Z", "2027-01-01"],
  ])("formats %s as the application calendar date %s", (instant, expected) => {
    expect(getApplicationDate(new Date(instant))).toBe(expected);
  });

  it("uses the current instant when no date is provided", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-14T22:00:00Z"));

    expect(getApplicationDate()).toBe("2026-07-15");
  });
});
