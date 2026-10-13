import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnd, mockPostgres, queries, state } = vi.hoisted(() => {
  const queries: { text: string; values: unknown[] }[] = [];
  const state: { failNext: boolean; latestRevision: string | undefined } = {
    failNext: false,
    latestRevision: undefined,
  };
  const mockEnd = vi.fn().mockResolvedValue(undefined);

  const tag = (
    strings: string | TemplateStringsArray,
    ...values: unknown[]
  ) => {
    if (typeof strings === "string") {
      return { identifier: strings };
    }
    let placeholder = 0;
    const text = strings.reduce((acc, part, index) => {
      if (index === 0) {
        return part;
      }
      const value = values[index - 1];
      const rendered =
        value && typeof value === "object" && "identifier" in value
          ? `"${String((value as { identifier: string }).identifier)}"`
          : `$${++placeholder}`;
      return acc + rendered + part;
    }, "");
    queries.push({
      text: text.replace(/\s+/g, " ").trim(),
      values: values.filter(
        (value) =>
          !(value && typeof value === "object" && "identifier" in value),
      ),
    });
    if (state.failNext) {
      state.failNext = false;
      return Promise.reject(new Error("db down"));
    }
    return Promise.resolve(
      state.latestRevision === undefined
        ? []
        : [{ revision: state.latestRevision }],
    );
  };

  const sql = Object.assign(tag, {
    begin: (fn: (tx: typeof tag) => Promise<unknown>) => fn(tag),
    end: mockEnd,
  });
  const mockPostgres = vi.fn().mockReturnValue(sql);
  return { mockEnd, mockPostgres, queries, state };
});

vi.mock("postgres", () => ({ default: mockPostgres }));

import { createTracker } from "../tracker.js";

const connection = {
  database: "db",
  host: "localhost",
  password: "pw",
  port: 5432,
  ssl: true,
  user: "user",
};
const table = { name: "revisions", schema: "tracker" };

const makeTracker = (revision = "rev-1") =>
  createTracker({ connection, revision, table });

describe("createTracker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queries.length = 0;
    state.failNext = false;
    state.latestRevision = undefined;
  });

  it("opens a small ssl pool from the connection config", () => {
    makeTracker();
    expect(mockPostgres).toHaveBeenCalledWith(
      expect.objectContaining({
        database: "db",
        host: "localhost",
        max: 2,
        password: "pw",
        port: 5432,
        ssl: "require",
        user: "user",
      }),
    );
  });

  it("disables ssl when the connection does not ask for it", () => {
    createTracker({
      connection: { ...connection, ssl: false },
      revision: "rev-1",
      table,
    });
    expect(mockPostgres).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: false }),
    );
  });

  it.each([
    { name: "revisions", schema: "bad schema" },
    { name: 'rev"; DROP TABLE x; --', schema: "tracker" },
    { name: "", schema: "tracker" },
  ])("rejects the invalid identifier %j", (invalidTable) => {
    expect(() =>
      createTracker({ connection, revision: "rev-1", table: invalidTable }),
    ).toThrow(/Invalid/);
    expect(mockPostgres).not.toHaveBeenCalled();
  });

  describe("register", () => {
    it("locks, creates the schema and table, then inserts the revision", async () => {
      await makeTracker("rev-7").register();

      expect(queries.map((query) => query.text)).toEqual([
        "SELECT pg_advisory_xact_lock(hashtext($1))",
        'CREATE SCHEMA IF NOT EXISTS "tracker"',
        expect.stringContaining(
          'CREATE TABLE IF NOT EXISTS "tracker"."revisions"',
        ),
        expect.stringContaining(
          'INSERT INTO "tracker"."revisions" (revision) VALUES ($1) ON CONFLICT (revision) DO NOTHING',
        ),
      ]);
      expect(queries[0]?.values).toEqual(["tracker.revisions.setup"]);
      expect(queries[3]?.values).toEqual(["rev-7"]);
    });

    it("runs only once after a success", async () => {
      const tracker = makeTracker();
      await tracker.register();
      const count = queries.length;
      await tracker.register();
      expect(queries).toHaveLength(count);
    });

    it("retries after a failure", async () => {
      const tracker = makeTracker();
      state.failNext = true;
      await expect(tracker.register()).rejects.toThrow("db down");

      queries.length = 0;
      await expect(tracker.register()).resolves.toBeUndefined();
      expect(queries.length).toBeGreaterThan(0);
    });
  });

  describe("isLatest", () => {
    it("is true when the latest registered revision is its own", async () => {
      state.latestRevision = "rev-1";
      await expect(makeTracker("rev-1").isLatest()).resolves.toBe(true);
      expect(queries[0]?.text).toBe(
        'SELECT revision FROM "tracker"."revisions" ORDER BY generation DESC LIMIT 1',
      );
    });

    it("is false when a newer revision registered", async () => {
      state.latestRevision = "rev-2";
      await expect(makeTracker("rev-1").isLatest()).resolves.toBe(false);
    });

    it("is false when nothing is registered", async () => {
      await expect(makeTracker().isLatest()).resolves.toBe(false);
    });

    it("propagates query failures", async () => {
      state.failNext = true;
      await expect(makeTracker().isLatest()).rejects.toThrow("db down");
    });
  });

  describe("close", () => {
    it("ends the pool once", async () => {
      const tracker = makeTracker();
      await tracker.close();
      await tracker.close();
      expect(mockEnd).toHaveBeenCalledOnce();
    });
  });
});
