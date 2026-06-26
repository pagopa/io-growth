import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RawSqlClient, RawSqlClientConfig } from "../client.js";

import { createRawSqlClient } from "../client.js";
import { runRecurrentMigrations } from "../recurrent-migrator.js";

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

vi.mock("../client.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../client.js")>();
  return { ...actual, createRawSqlClient: vi.fn() };
});

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const sha256 = (content: string) =>
  createHash("sha256").update(content).digest("hex");

const createMockSql = () => {
  const unsafe = vi.fn().mockResolvedValue(undefined);
  const sql = Object.assign(vi.fn().mockResolvedValue([]), {
    end: vi.fn().mockResolvedValue(undefined),
    unsafe,
  }) as unknown as RawSqlClient;

  return { sql, unsafe };
};

describe("runRecurrentMigrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early when the recurrent folder does not exist", async () => {
    asMock(readdir).mockRejectedValue(new Error("ENOENT"));
    const { sql } = createMockSql();

    await runRecurrentMigrations(sql, "/recurrent");

    expect(sql).not.toHaveBeenCalled();
  });

  it("returns early when no R__*.sql files are present", async () => {
    asMock(readdir).mockResolvedValue([
      "NOT_r.sql",
      "V1__versioned.sql",
      "README.md",
    ]);
    const { sql } = createMockSql();

    await runRecurrentMigrations(sql, "/recurrent");

    expect(sql).not.toHaveBeenCalled();
  });

  it("applies a new R__ file and records its checksum", async () => {
    const content = "CREATE POLICY all_rows ON foo;";
    const checksum = sha256(content);

    asMock(readdir).mockResolvedValue(["R__policies.sql"]);
    asMock(readFile).mockResolvedValue(content);

    const { sql, unsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([]) // SELECT checksum → not found
      .mockResolvedValueOnce([]); // INSERT INTO _recurrent_migrations

    await runRecurrentMigrations(sql, "/recurrent");

    expect(unsafe).toHaveBeenCalledWith(content);
    // The INSERT tagged template receives (strings, filename, checksum, checksum)
    const insertCall = asMock(sql).mock.calls[3];
    expect(insertCall[2]).toBe(checksum);
  });

  it("skips a file whose content has not changed", async () => {
    const content = "CREATE POLICY all_rows ON foo;";
    const checksum = sha256(content);

    asMock(readdir).mockResolvedValue(["R__policies.sql"]);
    asMock(readFile).mockResolvedValue(content);

    const { sql, unsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([{ checksum }]) // SELECT → same checksum → skip
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    await runRecurrentMigrations(sql, "/recurrent");

    expect(unsafe).not.toHaveBeenCalled();
  });

  it("re-applies a file whose content has changed", async () => {
    const updatedContent = "CREATE POLICY updated ON foo;";

    asMock(readdir).mockResolvedValue(["R__policies.sql"]);
    asMock(readFile).mockResolvedValue(updatedContent);

    const { sql, unsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([{ checksum: sha256("original content") }]) // SELECT → different checksum → re-apply
      .mockResolvedValueOnce([]); // INSERT ON CONFLICT UPDATE

    await runRecurrentMigrations(sql, "/recurrent");

    expect(unsafe).toHaveBeenCalledWith(updatedContent);
  });

  it("applies multiple R__ files in alphabetical order", async () => {
    asMock(readdir).mockResolvedValue(["R__z_last.sql", "R__a_first.sql"]);
    asMock(readFile)
      .mockResolvedValueOnce("FIRST;")
      .mockResolvedValueOnce("LAST;");

    const { sql, unsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // createTable
      .mockResolvedValueOnce([]) // SELECT R__a_first → not found
      .mockResolvedValueOnce([]) // INSERT R__a_first
      .mockResolvedValueOnce([]) // SELECT R__z_last → not found
      .mockResolvedValueOnce([]); // INSERT R__z_last

    await runRecurrentMigrations(sql, "/recurrent");

    const unsafeCalls = unsafe.mock.calls.map((args) => args[0] as string);
    expect(unsafeCalls).toEqual(["FIRST;", "LAST;"]);
  });
});

describe("runRecurrentMigrations — @database directive", () => {
  const connectionConfig: RawSqlClientConfig = {
    database: "main_db",
    host: "localhost",
    port: 5432,
    user: "pgadmin",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("runs the file against the override database when -- @database is present", async () => {
    const content = "-- @database other_db\nCREATE EXTENSION pg_cron;";

    asMock(readdir).mockResolvedValue(["R__cron.sql"]);
    asMock(readFile).mockResolvedValue(content);

    const { sql, unsafe: mainUnsafe } = createMockSql();
    const overrideUnsafe = vi.fn().mockResolvedValue(undefined);
    const overrideSql = {
      end: vi.fn().mockResolvedValue(undefined),
      unsafe: overrideUnsafe,
    };
    asMock(createRawSqlClient).mockReturnValue(overrideSql);

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([]) // SELECT checksum → not found
      .mockResolvedValueOnce([]) // INSERT
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    await runRecurrentMigrations(sql, "/recurrent", connectionConfig);

    expect(createRawSqlClient).toHaveBeenCalledWith({
      ...connectionConfig,
      database: "other_db",
    });
    expect(overrideUnsafe).toHaveBeenCalledWith(content);
    expect(overrideSql.end).toHaveBeenCalledWith();
    expect(mainUnsafe).not.toHaveBeenCalled();
  });

  it("uses the main sql client when no -- @database directive is present", async () => {
    const content = "CREATE POLICY all_rows ON foo;";

    asMock(readdir).mockResolvedValue(["R__policies.sql"]);
    asMock(readFile).mockResolvedValue(content);

    const { sql, unsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([]) // SELECT checksum → not found
      .mockResolvedValueOnce([]) // INSERT
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    await runRecurrentMigrations(sql, "/recurrent", connectionConfig);

    expect(createRawSqlClient).not.toHaveBeenCalled();
    expect(unsafe).toHaveBeenCalledWith(content);
  });

  it("uses the main sql client when connectionConfig is absent (backward compat)", async () => {
    const content = "-- @database other_db\nSOME SQL;";

    asMock(readdir).mockResolvedValue(["R__something.sql"]);
    asMock(readFile).mockResolvedValue(content);

    const { sql, unsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([]) // SELECT checksum → not found
      .mockResolvedValueOnce([]) // INSERT
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    // No connectionConfig passed — directive must be ignored
    await runRecurrentMigrations(sql, "/recurrent");

    expect(createRawSqlClient).not.toHaveBeenCalled();
    expect(unsafe).toHaveBeenCalledWith(content);
  });
});
