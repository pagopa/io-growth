import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import {
  buildSearchCondition,
  buildStatusCondition,
} from "../drizzle-opportunity.repository.js";

const render = (
  search: string,
  fields?: readonly ("name" | "operatorName")[],
): { params: unknown[]; sql: string } => {
  const condition = buildSearchCondition(search, fields);
  if (!condition) {
    throw new Error("buildSearchCondition returned undefined");
  }
  const query = new PgDialect().sqlToQuery(condition);
  return { params: query.params, sql: query.sql.toLowerCase() };
};

const renderStatus = (
  status: Parameters<typeof buildStatusCondition>[0],
  referenceDate?: string,
): { params: unknown[]; sql: string } => {
  const condition = buildStatusCondition(status, referenceDate);
  if (!condition) {
    throw new Error("buildStatusCondition returned undefined");
  }
  const query = new PgDialect().sqlToQuery(condition);
  return { params: query.params, sql: query.sql.toLowerCase() };
};

describe("buildSearchCondition", () => {
  it("searches only the opportunity name when no fields are given", () => {
    const { params, sql } = render("cultura");

    expect(params).toEqual(["%cultura%"]);
    expect(sql).toContain("localized_metadata");
    expect(sql).not.toContain("operator");
  });

  it("defaults to the opportunity name on an EMPTY fields array", () => {
    // The whole point: or() must never be called with zero operands.
    const { params, sql } = render("cultura", []);

    expect(params).toEqual(["%cultura%"]);
    expect(sql).toContain("localized_metadata");
    expect(sql).not.toContain("operator");
  });

  it("searches both opportunity name and operator name when requested", () => {
    const { params, sql } = render("cultura", ["name", "operatorName"]);

    expect(params).toEqual(["%cultura%", "%cultura%"]);
    expect(sql).toContain("localized_metadata");
    expect(sql).toContain("operator");
    expect(sql).toContain(" or ");
  });

  it("escapes LIKE wildcards in the search term", () => {
    const { params } = render("50%_off", ["name"]);

    expect(params).toEqual(["%50\\%\\_off%"]);
  });
});

describe("buildStatusCondition", () => {
  it("matches scheduled as published with a future dateFrom", () => {
    const { params, sql } = renderStatus("scheduled", "2026-06-26");

    expect(sql).toContain("= 'published'");
    expect(sql).toContain('"date_from" > $1');
    expect(params).toEqual(["2026-06-26"]);
  });

  it("matches published as already effective (dateFrom <= today)", () => {
    const { params, sql } = renderStatus("published", "2026-06-26");

    expect(sql).toContain("= 'published'");
    expect(sql).toContain('"date_from" <= $1');
    expect(params).toEqual(["2026-06-26"]);
  });

  it("uses a plain status equality for non-derived statuses", () => {
    const { params, sql } = renderStatus("draft", "2026-06-26");

    expect(sql).not.toContain("date_from");
    expect(params).toEqual(["draft"]);
  });

  it("falls back to plain equality when no reference date is provided", () => {
    const { params, sql } = renderStatus("published");

    expect(sql).not.toContain("date_from");
    expect(params).toEqual(["published"]);
  });
});
