import type { Schedule } from "pg-boss";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockBossInstance = {
  createQueue: vi.fn(),
  getSchedules: vi.fn(),
  on: vi.fn(),
  schedule: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  unschedule: vi.fn(),
  updateQueue: vi.fn(),
  work: vi.fn(),
};

const mockClient = {
  query: vi.fn(),
  release: vi.fn(),
};

// Revision that currently holds the highest generation in the registry.
let latestRevision = "rev-1";

const mockPool = {
  connect: vi.fn(),
  end: vi.fn(),
  query: vi.fn(),
};

vi.mock("pg-boss", () => ({
  PgBoss: vi.fn(() => mockBossInstance),
}));

vi.mock("pg", () => ({
  Pool: vi.fn(() => mockPool),
}));

const { PgBoss } = await import("pg-boss");
const { Pool } = await import("pg");
const { createScheduler } = await import("../scheduler.js");

const connection = {
  database: "db",
  host: "localhost",
  password: "pw",
  port: 5432,
  ssl: true,
  user: "user",
};

const makeScheduler = (
  overrides: Partial<Parameters<typeof createScheduler>[0]> = {},
) => createScheduler({ connection, revision: "rev-1", ...overrides });

type WorkHandler = (
  jobs: { data: object; signal: AbortSignal }[],
) => Promise<void>;

beforeEach(() => {
  vi.clearAllMocks();
  latestRevision = "rev-1";
  mockPool.connect.mockResolvedValue(mockClient);
  mockPool.end.mockResolvedValue(undefined);
  mockPool.query.mockImplementation((sql: string) =>
    Promise.resolve(
      sql.startsWith("SELECT")
        ? { rows: [{ revision: latestRevision }] }
        : { rows: [] },
    ),
  );
  mockClient.query.mockResolvedValue({ rows: [] });
  mockBossInstance.getSchedules.mockResolvedValue([]);
  mockBossInstance.start.mockResolvedValue(undefined);
  mockBossInstance.createQueue.mockResolvedValue(undefined);
  mockBossInstance.updateQueue.mockResolvedValue(undefined);
  mockBossInstance.schedule.mockResolvedValue(undefined);
  mockBossInstance.unschedule.mockResolvedValue(undefined);
  mockBossInstance.work.mockResolvedValue("worker-id");
  mockBossInstance.stop.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("createScheduler start as owner", () => {
  it("creates the registry table and claims the revision", async () => {
    const scheduler = makeScheduler();

    await scheduler.start();

    expect(Pool).toHaveBeenCalledWith(
      expect.objectContaining({ database: "db", host: "localhost" }),
    );
    const ddl = mockClient.query.mock.calls.map(([sql]) => String(sql));
    expect(ddl.some((sql) => sql.includes("pg_advisory_xact_lock"))).toBe(true);
    expect(
      ddl.some((sql) =>
        sql.includes("CREATE TABLE IF NOT EXISTS io_core_scheduler"),
      ),
    ).toBe(true);
    expect(ddl).toContain("COMMIT");
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("ON CONFLICT (revision) DO NOTHING"),
      ["rev-1"],
    );
    expect(mockClient.release).toHaveBeenCalledOnce();
  });

  it("constructs pg-boss with the connection config and the revision as instance name", async () => {
    await makeScheduler().start();

    expect(PgBoss).toHaveBeenCalledWith({
      database: "db",
      host: "localhost",
      instanceName: "rev-1",
      password: "pw",
      port: 5432,
      ssl: true,
      user: "user",
    });
  });

  it("forwards pg-boss errors and warnings to onEvent", async () => {
    const onEvent = vi.fn();
    await makeScheduler({ onEvent }).start();

    const handlers = new Map(
      mockBossInstance.on.mock.calls as [string, (e: unknown) => void][],
    );
    const error = new Error("boom");
    handlers.get("error")?.(error);
    handlers.get("warning")?.("warn");

    expect(onEvent).toHaveBeenCalledWith(error);
    expect(onEvent).toHaveBeenCalledWith("warn");
  });

  it("creates the queue, schedules the cron and starts a worker for every registered job", async () => {
    const scheduler = makeScheduler({ pollingIntervalSeconds: 10 });

    scheduler.schedule({
      cron: "* * * * *",
      data: { foo: "bar" },
      expireInSeconds: 120,
      handler: vi.fn(),
      name: "job-a",
      timezone: "Europe/Rome",
    });

    await scheduler.start();

    const queueOptions = {
      expireInSeconds: 120,
      heartbeatSeconds: 30,
      retryDelay: 30,
    };
    expect(mockBossInstance.start).toHaveBeenCalledOnce();
    expect(mockBossInstance.createQueue).toHaveBeenCalledWith(
      "job-a",
      queueOptions,
    );
    expect(mockBossInstance.updateQueue).toHaveBeenCalledWith(
      "job-a",
      queueOptions,
    );
    expect(mockBossInstance.schedule).toHaveBeenCalledWith(
      "job-a",
      "* * * * *",
      { foo: "bar" },
      { tz: "Europe/Rome" },
    );
    expect(mockBossInstance.work).toHaveBeenCalledWith(
      "job-a",
      { pollingIntervalSeconds: 10 },
      expect.any(Function),
    );
  });

  it("leaves expireInSeconds to the pg-boss default when the job does not set it", async () => {
    const scheduler = makeScheduler();
    scheduler.schedule({
      cron: "* * * * *",
      handler: vi.fn(),
      name: "job-a",
    });

    await scheduler.start();

    expect(mockBossInstance.createQueue).toHaveBeenCalledWith("job-a", {
      heartbeatSeconds: 30,
      retryDelay: 30,
    });
  });

  it("invokes the job handler with the data and abort signal of every received job", async () => {
    const scheduler = makeScheduler();
    const handler = vi.fn().mockResolvedValue(undefined);
    scheduler.schedule({ cron: "* * * * *", handler, name: "job-a" });
    await scheduler.start();

    const [, , workHandler] = mockBossInstance.work.mock.calls[0] as [
      string,
      object,
      WorkHandler,
    ];
    const signal1 = new AbortController().signal;
    const signal2 = new AbortController().signal;
    await workHandler([
      { data: { n: 1 }, signal: signal1 },
      { data: { n: 2 }, signal: signal2 },
    ]);

    expect(handler).toHaveBeenNthCalledWith(1, { n: 1 }, { signal: signal1 });
    expect(handler).toHaveBeenNthCalledWith(2, { n: 2 }, { signal: signal2 });
  });

  it("unschedules db jobs that are no longer registered on this instance", async () => {
    mockBossInstance.getSchedules.mockResolvedValue([
      { name: "stale-job" },
      { name: "job-a" },
    ] as Schedule[]);

    const scheduler = makeScheduler();
    scheduler.schedule({
      cron: "* * * * *",
      handler: vi.fn(),
      name: "job-a",
    });

    await scheduler.start();

    expect(mockBossInstance.unschedule).toHaveBeenCalledWith("stale-job");
    expect(mockBossInstance.unschedule).not.toHaveBeenCalledWith("job-a");
  });

  it("stops pg-boss and rethrows when starting the workers fails", async () => {
    mockBossInstance.createQueue.mockRejectedValue(new Error("db down"));
    const scheduler = makeScheduler();
    scheduler.schedule({
      cron: "* * * * *",
      handler: vi.fn(),
      name: "job-a",
    });

    await expect(scheduler.start()).rejects.toThrow("db down");

    expect(mockBossInstance.stop).toHaveBeenCalledOnce();
  });
});

describe("createScheduler start as a superseded revision", () => {
  beforeEach(() => {
    latestRevision = "rev-2";
  });

  it("stays passive: no pg-boss, no schedule changes", async () => {
    const scheduler = makeScheduler();
    scheduler.schedule({
      cron: "* * * * *",
      handler: vi.fn(),
      name: "job-a",
    });

    await scheduler.start();

    expect(PgBoss).not.toHaveBeenCalled();
    expect(mockBossInstance.schedule).not.toHaveBeenCalled();
    expect(mockBossInstance.unschedule).not.toHaveBeenCalled();
    expect(mockBossInstance.work).not.toHaveBeenCalled();
  });
});

describe("createScheduler ownership changes at runtime", () => {
  it("stops pg-boss gracefully when a newer revision takes over", async () => {
    vi.useFakeTimers();
    const scheduler = makeScheduler({
      ownershipCheckSeconds: 5,
      stopTimeoutSeconds: 20,
    });
    await scheduler.start();

    latestRevision = "rev-2";
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockBossInstance.stop).toHaveBeenCalledWith({
      graceful: true,
      timeout: 20000,
    });
  });

  it("starts as owner when a passive revision becomes the latest again", async () => {
    vi.useFakeTimers();
    latestRevision = "rev-2";
    const scheduler = makeScheduler({ ownershipCheckSeconds: 5 });
    await scheduler.start();
    expect(PgBoss).not.toHaveBeenCalled();

    latestRevision = "rev-1";
    await vi.advanceTimersByTimeAsync(5000);

    expect(PgBoss).toHaveBeenCalledOnce();
    expect(mockBossInstance.start).toHaveBeenCalledOnce();
  });

  it("reports ownership check failures through onEvent without stopping", async () => {
    vi.useFakeTimers();
    const onEvent = vi.fn();
    const scheduler = makeScheduler({ onEvent, ownershipCheckSeconds: 5 });
    await scheduler.start();

    const failure = new Error("registry down");
    mockPool.query.mockRejectedValue(failure);
    await vi.advanceTimersByTimeAsync(5000);

    expect(onEvent).toHaveBeenCalledWith(failure);
    expect(mockBossInstance.stop).not.toHaveBeenCalled();
  });

  it("fences a job fetched after a newer revision took over", async () => {
    const scheduler = makeScheduler();
    const handler = vi.fn().mockResolvedValue(undefined);
    scheduler.schedule({ cron: "* * * * *", handler, name: "job-a" });
    await scheduler.start();
    const [, , workHandler] = mockBossInstance.work.mock.calls[0] as [
      string,
      object,
      WorkHandler,
    ];

    latestRevision = "rev-2";
    await expect(
      workHandler([{ data: {}, signal: new AbortController().signal }]),
    ).rejects.toThrow("no longer owns scheduled jobs");

    expect(handler).not.toHaveBeenCalled();
    expect(mockBossInstance.stop).toHaveBeenCalledOnce();
  });
});

describe("createScheduler stop", () => {
  it("stops pg-boss gracefully with the timeout and closes the registry pool", async () => {
    const scheduler = makeScheduler({ stopTimeoutSeconds: 7 });
    await scheduler.start();

    await scheduler.stop();

    expect(mockBossInstance.stop).toHaveBeenCalledWith({
      graceful: true,
      timeout: 7000,
    });
    expect(mockPool.end).toHaveBeenCalledOnce();
  });

  it("is safe to call twice", async () => {
    const scheduler = makeScheduler();
    await scheduler.start();

    await scheduler.stop();
    await scheduler.stop();

    expect(mockBossInstance.stop).toHaveBeenCalledOnce();
    expect(mockPool.end).toHaveBeenCalledOnce();
  });

  it("only closes the pool when passive", async () => {
    latestRevision = "rev-2";
    const scheduler = makeScheduler();
    await scheduler.start();

    await scheduler.stop();

    expect(mockBossInstance.stop).not.toHaveBeenCalled();
    expect(mockPool.end).toHaveBeenCalledOnce();
  });

  it("stops the ownership timer", async () => {
    vi.useFakeTimers();
    const scheduler = makeScheduler({ ownershipCheckSeconds: 5 });
    await scheduler.start();
    await scheduler.stop();
    mockPool.query.mockClear();

    await vi.advanceTimersByTimeAsync(20000);

    expect(mockPool.query).not.toHaveBeenCalled();
  });
});
