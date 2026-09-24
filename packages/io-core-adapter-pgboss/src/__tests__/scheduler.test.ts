import type { Schedule } from "pg-boss";

import { beforeEach, describe, expect, it, vi } from "vitest";

const mockBossInstance = {
  createQueue: vi.fn(),
  getSchedules: vi.fn(),
  on: vi.fn(),
  schedule: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  unschedule: vi.fn(),
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

beforeEach(() => {
  vi.clearAllMocks();
  mockBossInstance.getSchedules.mockResolvedValue([]);
  mockBossInstance.start.mockResolvedValue(undefined);
  mockBossInstance.createQueue.mockResolvedValue(undefined);
  mockBossInstance.schedule.mockResolvedValue(undefined);
  mockBossInstance.unschedule.mockResolvedValue(undefined);
  mockBossInstance.work.mockResolvedValue("worker-id");
  mockBossInstance.stop.mockResolvedValue(undefined);
});

describe("createScheduler", () => {
  it("constructs pg-boss with the given connection config", () => {
    createScheduler({ connection, pollingIntervalSeconds: 5 });

    expect(PgBoss).toHaveBeenCalledWith({
      database: "db",
      host: "localhost",
      password: "pw",
      port: 5432,
      ssl: true,
      user: "user",
    });
  });

  it("registers an error listener that forwards to onError", () => {
    const onEvent = vi.fn();
    createScheduler({ connection, onEvent: onEvent });

    const [, handler] = mockBossInstance.on.mock.calls[0] as [
      string,
      (error: unknown) => void,
    ];
    const error = new Error("boom");
    handler(error);

    expect(onEvent).toHaveBeenCalledWith(error);
  });

  describe("start", () => {
    it("creates the queue, schedules the cron and starts a worker for every registered job", async () => {
      const scheduler = createScheduler({
        connection,
        pollingIntervalSeconds: 10,
      });
      const handler = vi.fn().mockResolvedValue(undefined);

      scheduler.schedule({
        cron: "* * * * *",
        data: { foo: "bar" },
        handler,
        name: "job-a",
        timezone: "Europe/Rome",
      });

      await scheduler.start();

      expect(mockBossInstance.start).toHaveBeenCalledOnce();
      expect(mockBossInstance.createQueue).toHaveBeenCalledWith("job-a");
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

    it("invokes the job handler for every job received by the pg-boss worker", async () => {
      const scheduler = createScheduler({ connection });
      const handler = vi.fn().mockResolvedValue(undefined);

      scheduler.schedule({ cron: "* * * * *", handler, name: "job-a" });
      await scheduler.start();

      const [, , workHandler] = mockBossInstance.work.mock.calls[0] as [
        string,
        object,
        (jobs: { data: object }[]) => Promise<void>,
      ];
      await workHandler([{ data: { n: 1 } }, { data: { n: 2 } }]);

      expect(handler).toHaveBeenNthCalledWith(1, { n: 1 });
      expect(handler).toHaveBeenNthCalledWith(2, { n: 2 });
    });

    it("unschedules db jobs that are no longer registered on this instance", async () => {
      mockBossInstance.getSchedules.mockResolvedValue([
        { name: "stale-job" },
        { name: "job-a" },
      ] as Schedule[]);

      const scheduler = createScheduler({ connection });
      scheduler.schedule({
        cron: "* * * * *",
        handler: vi.fn(),
        name: "job-a",
      });

      await scheduler.start();

      expect(mockBossInstance.unschedule).toHaveBeenCalledWith("stale-job");
      expect(mockBossInstance.unschedule).not.toHaveBeenCalledWith("job-a");
    });
  });

  describe("stop", () => {
    it("delegates to pg-boss stop", async () => {
      const scheduler = createScheduler({ connection });

      await scheduler.stop();

      expect(mockBossInstance.stop).toHaveBeenCalledOnce();
    });
  });
});
