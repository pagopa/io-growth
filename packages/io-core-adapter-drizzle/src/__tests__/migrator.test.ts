import { readdir, readFile } from "node:fs/promises";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { RawSqlClient } from "../client.js";

import { runVersionedMigrations } from "../migrator.js";

vi.mock("node:fs/promises", () => ({
  readdir: vi.fn(),
  readFile: vi.fn(),
}));

const asMock = (fn: unknown) => fn as ReturnType<typeof vi.fn>;

const createMockSql = () => {
  const txUnsafe = vi.fn().mockResolvedValue(undefined);
  const txMock = Object.assign(vi.fn().mockResolvedValue([]), {
    unsafe: txUnsafe,
  }) as unknown as RawSqlClient;

  const begin = vi
    .fn()
    .mockImplementation((fn: (tx: RawSqlClient) => Promise<void>) =>
      fn(txMock),
    );

  const sql = Object.assign(vi.fn().mockResolvedValue([]), {
    begin,
    end: vi.fn().mockResolvedValue(undefined),
    unsafe: vi.fn().mockResolvedValue(undefined),
  }) as unknown as RawSqlClient;

  return { begin, sql, txMock, txUnsafe };
};

describe("runVersionedMigrations", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early when the migrations folder does not exist", async () => {
    asMock(readdir).mockRejectedValue(new Error("ENOENT"));
    const { sql } = createMockSql();

    await runVersionedMigrations(sql, "/migrations");

    expect(sql).not.toHaveBeenCalled();
  });

  it("returns early when no .sql files are found in the folder", async () => {
    asMock(readdir).mockResolvedValue(["README.md", ".gitkeep"]);
    const { sql } = createMockSql();

    await runVersionedMigrations(sql, "/migrations");

    expect(sql).not.toHaveBeenCalled();
  });

  it("skips a file that is already recorded in _versioned_migrations", async () => {
    asMock(readdir).mockResolvedValue(["001_init.sql"]);
    const { begin, sql, txUnsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([{ filename: "001_init.sql" }]) // SELECT → already applied
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    await runVersionedMigrations(sql, "/migrations");

    expect(begin).not.toHaveBeenCalled();
    expect(txUnsafe).not.toHaveBeenCalled();
  });

  it("applies a new file inside a transaction", async () => {
    asMock(readdir).mockResolvedValue(["001_init.sql"]);
    asMock(readFile).mockResolvedValue("CREATE TABLE foo;");
    const { begin, sql, txUnsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([]) // SELECT → not applied
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    await runVersionedMigrations(sql, "/migrations");

    expect(begin).toHaveBeenCalledOnce();
    expect(txUnsafe).toHaveBeenCalledWith("CREATE TABLE foo;");
  });

  it("applies multiple files in alphabetical order", async () => {
    asMock(readdir).mockResolvedValue(["003_c.sql", "001_a.sql", "002_b.sql"]);
    asMock(readFile)
      .mockResolvedValueOnce("SQL A;")
      .mockResolvedValueOnce("SQL B;")
      .mockResolvedValueOnce("SQL C;");
    const { sql, txUnsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([]) // SELECT 001_a → not applied
      .mockResolvedValueOnce([]) // SELECT 002_b → not applied
      .mockResolvedValueOnce([]) // SELECT 003_c → not applied
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    await runVersionedMigrations(sql, "/migrations");

    const unsafeCalls = txUnsafe.mock.calls.map((args) => args[0] as string);
    expect(unsafeCalls).toEqual(["SQL A;", "SQL B;", "SQL C;"]);
  });

  it("skips already-applied files and applies only new ones", async () => {
    asMock(readdir).mockResolvedValue(["001_a.sql", "002_b.sql"]);
    asMock(readFile).mockResolvedValue("NEW SQL;");
    const { begin, sql, txUnsafe } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([{ filename: "001_a.sql" }]) // SELECT 001_a → exists, skip
      .mockResolvedValueOnce([]) // SELECT 002_b → not applied
      .mockResolvedValueOnce([]); // pg_advisory_unlock

    await runVersionedMigrations(sql, "/migrations");

    expect(begin).toHaveBeenCalledOnce();
    expect(txUnsafe).toHaveBeenCalledWith("NEW SQL;");
  });

  it("releases the advisory lock even when a migration throws", async () => {
    asMock(readdir).mockResolvedValue(["001_init.sql"]);
    asMock(readFile).mockResolvedValue("bad sql;");
    const { begin, sql } = createMockSql();

    asMock(sql)
      .mockResolvedValueOnce([]) // pg_advisory_lock
      .mockResolvedValueOnce([]) // CREATE TABLE IF NOT EXISTS
      .mockResolvedValueOnce([]); // SELECT → not applied
    begin.mockRejectedValue(new Error("tx failed"));

    await expect(runVersionedMigrations(sql, "/migrations")).rejects.toThrow(
      "tx failed",
    );

    // advisory_lock + createTable + SELECT + advisory_unlock (finally)
    expect(asMock(sql)).toHaveBeenCalledTimes(4);
  });
});
