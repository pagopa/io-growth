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

vi.mock("pg-boss", () => ({
  PgBoss: vi.fn(() => mockBossInstance),
}));

const { PgBoss } = await import("pg-boss");
const { createScheduler } = await import("../scheduler.js");

const connection = {
  database: "db",
  host: "localhost",
  password: "pw",
  port: 5432,
  ssl: true,
  user: "user",
};

const mockTracing = { emitEvent: vi.fn() };

// Whether the scheduler currently owns the jobs, as answered by isOwned.
let owned = true;
const isOwned = vi.fn(() => Promise.resolve(owned));

const makeScheduler = (
  overrides: Partial<Parameters<typeof createScheduler>[0]> = {},
) =>
  createScheduler({
    connection,
    environment: "prod",
    isOwned,
    tracingRepository: mockTracing,
    ...overrides,
  });

const traced = (
  name: string,
  data: Record<string, unknown> = {},
): [string, object] => [
  name,
  {
    caller: "JobsScheduler",
    data: { environment: "prod", ...data },
  },
];

const tracedEventNames = (): string[] =>
  mockTracing.emitEvent.mock.calls.map(([name]) => String(name));

type WorkHandler = (
  jobs: { data: object; id?: string; signal: AbortSignal }[],
) => Promise<void>;

beforeEach(() => {
  vi.clearAllMocks();
  owned = true;
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
  it("constructs pg-boss with the connection config", async () => {
    await makeScheduler().start();

    expect(PgBoss).toHaveBeenCalledWith({
      database: "db",
      host: "localhost",
      password: "pw",
      port: 5432,
      ssl: true,
      user: "user",
    });
  });

  it("passes the instance name through to pg-boss", async () => {
    await makeScheduler({ instanceName: "rev-1" }).start();

    expect(PgBoss).toHaveBeenCalledWith(
      expect.objectContaining({ instanceName: "rev-1" }),
    );
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

  it("traces and rethrows a failing job handler so pg-boss can retry it", async () => {
    const scheduler = makeScheduler();
    const failure = new Error("boom");
    const handler = vi.fn().mockRejectedValue(failure);
    scheduler.schedule({ cron: "* * * * *", handler, name: "job-a" });
    await scheduler.start();
    const [, , workHandler] = mockBossInstance.work.mock.calls[0] as [
      string,
      object,
      WorkHandler,
    ];

    await expect(
      workHandler([
        { data: {}, id: "job-1", signal: new AbortController().signal },
      ]),
    ).rejects.toBe(failure);

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.job_failed", {
        error: { message: "boom", name: "Error" },
        job: "job-a",
        jobId: "job-1",
      }),
    );
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

describe("createScheduler start without isOwned", () => {
  it("starts pg-boss right away and never checks ownership", async () => {
    vi.useFakeTimers();
    const scheduler = makeScheduler({
      isOwned: undefined,
      ownershipCheckSeconds: 5,
    });
    const handler = vi.fn().mockResolvedValue(undefined);
    scheduler.schedule({ cron: "* * * * *", handler, name: "job-a" });

    await scheduler.start();
    await vi.advanceTimersByTimeAsync(20000);

    expect(PgBoss).toHaveBeenCalledOnce();
    expect(mockBossInstance.work).toHaveBeenCalledOnce();
    expect(isOwned).not.toHaveBeenCalled();
    expect(mockBossInstance.stop).not.toHaveBeenCalled();
  });

  it("runs jobs without any fence", async () => {
    const scheduler = makeScheduler({ isOwned: undefined });
    const handler = vi.fn().mockResolvedValue(undefined);
    scheduler.schedule({ cron: "* * * * *", handler, name: "job-a" });
    await scheduler.start();
    const [, , workHandler] = mockBossInstance.work.mock.calls[0] as [
      string,
      object,
      WorkHandler,
    ];

    await workHandler([{ data: {}, signal: new AbortController().signal }]);

    expect(handler).toHaveBeenCalledOnce();
  });

  it("traces the started role as owner", async () => {
    await makeScheduler({ isOwned: undefined }).start();

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.started", { role: "owner" }),
    );
  });

  it("stops pg-boss on stop", async () => {
    const scheduler = makeScheduler({ isOwned: undefined });
    await scheduler.start();

    await scheduler.stop();

    expect(mockBossInstance.stop).toHaveBeenCalledOnce();
  });
});

describe("createScheduler start while not owning the jobs", () => {
  beforeEach(() => {
    owned = false;
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
  it("stops pg-boss gracefully when ownership is lost", async () => {
    vi.useFakeTimers();
    const scheduler = makeScheduler({
      ownershipCheckSeconds: 5,
      stopTimeoutSeconds: 20,
    });
    await scheduler.start();

    owned = false;
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockBossInstance.stop).toHaveBeenCalledWith({
      graceful: true,
      timeout: 20000,
    });
  });

  it("starts as owner when a passive scheduler gains ownership", async () => {
    vi.useFakeTimers();
    owned = false;
    const scheduler = makeScheduler({ ownershipCheckSeconds: 5 });
    await scheduler.start();
    expect(PgBoss).not.toHaveBeenCalled();

    owned = true;
    await vi.advanceTimersByTimeAsync(5000);

    expect(PgBoss).toHaveBeenCalledOnce();
    expect(mockBossInstance.start).toHaveBeenCalledOnce();
  });

  it("fences a job fetched after ownership was lost", async () => {
    const scheduler = makeScheduler();
    const handler = vi.fn().mockResolvedValue(undefined);
    scheduler.schedule({ cron: "* * * * *", handler, name: "job-a" });
    await scheduler.start();
    const [, , workHandler] = mockBossInstance.work.mock.calls[0] as [
      string,
      object,
      WorkHandler,
    ];

    owned = false;
    await expect(
      workHandler([{ data: {}, signal: new AbortController().signal }]),
    ).rejects.toThrow("no longer owns scheduled jobs");

    expect(handler).not.toHaveBeenCalled();
    expect(mockBossInstance.stop).toHaveBeenCalledOnce();
  });
});

describe("createScheduler stop", () => {
  it("stops pg-boss gracefully with the timeout", async () => {
    const scheduler = makeScheduler({ stopTimeoutSeconds: 7 });
    await scheduler.start();

    await scheduler.stop();

    expect(mockBossInstance.stop).toHaveBeenCalledWith({
      graceful: true,
      timeout: 7000,
    });
  });

  it("is safe to call twice", async () => {
    const scheduler = makeScheduler();
    await scheduler.start();

    await scheduler.stop();
    await scheduler.stop();

    expect(mockBossInstance.stop).toHaveBeenCalledOnce();
  });

  it("does not touch pg-boss when passive", async () => {
    owned = false;
    const scheduler = makeScheduler();
    await scheduler.start();

    await scheduler.stop();

    expect(mockBossInstance.stop).not.toHaveBeenCalled();
  });

  it("stops the ownership timer", async () => {
    vi.useFakeTimers();
    const scheduler = makeScheduler({ ownershipCheckSeconds: 5 });
    await scheduler.start();
    await scheduler.stop();
    isOwned.mockClear();

    await vi.advanceTimersByTimeAsync(20000);

    expect(isOwned).not.toHaveBeenCalled();
  });
});

describe("createScheduler tracing", () => {
  it("traces a started owner with its role", async () => {
    await makeScheduler().start();

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.started", { role: "owner" }),
    );
  });

  it("traces a scheduler that does not own the jobs as passive", async () => {
    owned = false;

    await makeScheduler().start();

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.started", { role: "passive" }),
    );
    expect(tracedEventNames()).not.toContain("scheduler.job_rejected");
  });

  it("traces pg-boss errors and warnings as scheduler.event", async () => {
    await makeScheduler().start();

    const handlers = new Map(
      mockBossInstance.on.mock.calls as [string, (e: unknown) => void][],
    );
    const error = new Error("boom");
    handlers.get("error")?.(error);
    handlers.get("warning")?.("warn");

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.event", { event: error }),
    );
    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.event", { event: "warn" }),
    );
  });

  it("traces ownership check failures without stopping", async () => {
    vi.useFakeTimers();
    const scheduler = makeScheduler({ ownershipCheckSeconds: 5 });
    await scheduler.start();

    const failure = new Error("tracker down");
    isOwned.mockRejectedValueOnce(failure);
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.event", { event: failure }),
    );
    expect(mockBossInstance.stop).not.toHaveBeenCalled();
  });

  it("traces a passive scheduler that gains ownership", async () => {
    vi.useFakeTimers();
    owned = false;
    await makeScheduler({ ownershipCheckSeconds: 5 }).start();

    owned = true;
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.promoted"),
    );
  });

  it("traces a demotion found by the ownership check", async () => {
    vi.useFakeTimers();
    await makeScheduler({ ownershipCheckSeconds: 5 }).start();

    owned = false;
    await vi.advanceTimersByTimeAsync(5000);

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.demoted", { trigger: "ownership_check" }),
    );
  });

  it("traces every rejected job but only one demotion when workers race", async () => {
    const scheduler = makeScheduler();
    scheduler.schedule({
      cron: "* * * * *",
      handler: vi.fn(),
      name: "job-a",
    });
    await scheduler.start();
    const [, , workHandler] = mockBossInstance.work.mock.calls[0] as [
      string,
      object,
      WorkHandler,
    ];
    const jobs = [{ data: {}, signal: new AbortController().signal }];

    owned = false;
    await Promise.allSettled([workHandler(jobs), workHandler(jobs)]);

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.job_rejected", { job: "job-a" }),
    );
    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.demoted", { trigger: "job_fence" }),
    );
    expect(
      tracedEventNames().filter((name) => name === "scheduler.job_rejected"),
    ).toHaveLength(2);
    expect(
      tracedEventNames().filter((name) => name === "scheduler.demoted"),
    ).toHaveLength(1);
    expect(mockBossInstance.stop).toHaveBeenCalledOnce();
  });

  it("traces the role on stop, once", async () => {
    const scheduler = makeScheduler();
    await scheduler.start();

    await scheduler.stop();
    await scheduler.stop();

    expect(mockTracing.emitEvent).toHaveBeenCalledWith(
      ...traced("scheduler.stopped", { role: "owner" }),
    );
    expect(
      tracedEventNames().filter((name) => name === "scheduler.stopped"),
    ).toHaveLength(1);
  });

  it("runs without a tracing repository", async () => {
    const scheduler = makeScheduler({ tracingRepository: undefined });

    await scheduler.start();
    await scheduler.stop();

    expect(mockTracing.emitEvent).not.toHaveBeenCalled();
  });
});
