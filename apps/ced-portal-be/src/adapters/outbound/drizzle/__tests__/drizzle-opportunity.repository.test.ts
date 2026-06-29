import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

import { buildSearchCondition } from "../drizzle-opportunity.repository.js";

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
