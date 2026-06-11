import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockEnd, mockPostgres } = vi.hoisted(() => {
  const mockEnd = vi.fn().mockResolvedValue(undefined);
  const mockPostgres = vi.fn().mockReturnValue({ end: mockEnd });
  return { mockEnd, mockPostgres };
});

vi.mock("postgres", () => ({ default: mockPostgres }));
vi.mock("drizzle-orm/postgres-js", () => ({
  drizzle: vi.fn().mockReturnValue({}),
}));

import { drizzle } from "drizzle-orm/postgres-js";

import { createTypedDbClient } from "../client.js";

const baseConfig = {
  database: "testdb",
  host: "localhost",
  port: 5432,
  user: "user",
};

describe("createTypedDbClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPostgres.mockReturnValue({ end: mockEnd });
  });

  it("attaches a closeConnection method that calls sql.end", async () => {
    const client = createTypedDbClient(baseConfig);
    await client.closeConnection();
    expect(mockEnd).toHaveBeenCalledOnce();
  });

  it("maps ssl: true to 'require'", () => {
    createTypedDbClient({ ...baseConfig, ssl: true });
    expect(mockPostgres).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: "require" }),
    );
  });

  it("maps ssl: false to false", () => {
    createTypedDbClient({ ...baseConfig, ssl: false });
    expect(mockPostgres).toHaveBeenCalledWith(
      expect.objectContaining({ ssl: false }),
    );
  });

  it("defaults max connections to 10 when not provided", () => {
    createTypedDbClient(baseConfig);
    expect(mockPostgres).toHaveBeenCalledWith(
      expect.objectContaining({ max: 10 }),
    );
  });

  it("uses the provided max value", () => {
    createTypedDbClient({ ...baseConfig, max: 5 });
    expect(mockPostgres).toHaveBeenCalledWith(
      expect.objectContaining({ max: 5 }),
    );
  });
});

describe("createTypedDbClient — onTransaction hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPostgres.mockReturnValue({ end: mockEnd });
  });

  it("calls onTransaction hook before the user callback", async () => {
    const mockTx = {};
    const mockTransaction = vi
      .fn()
      .mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn(mockTx),
      );

    vi.mocked(drizzle).mockReturnValueOnce({
      transaction: mockTransaction,
    } as unknown as ReturnType<typeof drizzle>);

    const onTransaction = vi.fn().mockResolvedValue(undefined);
    const userCallbackSpy = vi.fn().mockResolvedValue(undefined);

    const client = createTypedDbClient({ ...baseConfig, onTransaction });
    await client.transaction(userCallbackSpy);

    expect(onTransaction).toHaveBeenCalledOnce();
    expect(userCallbackSpy).toHaveBeenCalledOnce();
    expect(onTransaction.mock.invocationCallOrder[0]).toBeLessThan(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      userCallbackSpy.mock.invocationCallOrder[0]!,
    );
  });

  it("does not patch transaction when onTransaction is not provided", async () => {
    const mockTx = {};
    const userCallbackSpy = vi.fn().mockResolvedValue(undefined);
    const mockTransaction = vi
      .fn()
      .mockImplementation(async (fn: (tx: unknown) => Promise<unknown>) =>
        fn(mockTx),
      );

    vi.mocked(drizzle).mockReturnValueOnce({
      transaction: mockTransaction,
    } as unknown as ReturnType<typeof drizzle>);

    const client = createTypedDbClient(baseConfig);
    await client.transaction(userCallbackSpy);

    expect(mockTransaction).toHaveBeenCalledWith(userCallbackSpy);
    expect(userCallbackSpy).toHaveBeenCalledOnce();
  });
});
