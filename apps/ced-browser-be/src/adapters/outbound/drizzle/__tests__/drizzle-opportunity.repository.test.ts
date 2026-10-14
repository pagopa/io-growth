import { createTypedDbClient } from "@pagopa/io-core-adapter-drizzle";
import { SQL } from "drizzle-orm";
import { PgDialect } from "drizzle-orm/pg-core";
import { ok } from "neverthrow";
import { afterEach, describe, expect, it, vi } from "vitest";

import { createDrizzleOpportunityRepository } from "../drizzle-opportunity.repository.js";
import * as schema from "../schema/index.js";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("findPublishedById", () => {
  it.each([
    ["2026-07-14T21:59:59Z", "2026-07-14"],
    ["2026-07-14T22:00:00Z", "2026-07-15"],
    ["2026-01-14T23:00:00Z", "2026-01-15"],
    ["2026-03-29T22:00:00Z", "2026-03-30"],
    ["2026-10-25T23:00:00Z", "2026-10-26"],
  ])("uses the Rome visibility date at %s", async (instant, expectedDate) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(instant));
    const db = createTypedDbClient(
      { database: "unused", host: "localhost", port: 5432, user: "unused" },
      schema,
    );
    const findFirst = vi
      .spyOn(db.query.opportunity, "findFirst")
      .mockResolvedValue(undefined);
    const repository = createDrizzleOpportunityRepository(db);

    try {
      await expect(
        repository.findPublishedById({
          language: "it",
          opportunityId: "opportunity",
        }),
      ).resolves.toEqual(ok(undefined));
      const where = findFirst.mock.calls[0]?.[0]?.where;
      if (!(where instanceof SQL)) {
        throw new Error("Expected an opportunity visibility SQL condition");
      }
      expect(new PgDialect().sqlToQuery(where).params).toEqual([
        "opportunity",
        "published",
        expectedDate,
        expectedDate,
      ]);
    } finally {
      await db.closeConnection();
    }
  });
});
