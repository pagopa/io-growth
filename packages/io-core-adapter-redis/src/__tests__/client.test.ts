import { createCluster } from "@redis/client";
import { EventEmitter } from "node:events";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { RedisClientConfig } from "../client.js";

import { createRedisClient, createResilientRedisClient } from "../client.js";

vi.mock("@azure/identity", () => ({ DefaultAzureCredential: vi.fn() }));
vi.mock("@redis/entraid", () => ({
  EntraIdCredentialsProviderFactory: {
    createForDefaultAzureCredential: vi.fn(),
  },
  REDIS_SCOPE_DEFAULT: "scope",
}));
vi.mock("@redis/client", () => ({ createCluster: vi.fn() }));

const never = <T>() => new Promise<T>(() => undefined);

// Captures a rejection without awaiting it, so fake timers can be advanced.
const rejectionOf = (promise: Promise<unknown>): Promise<unknown> =>
  promise.then(
    () => {
      throw new Error("Expected the promise to reject");
    },
    (error: unknown) => error,
  );

class FakeCluster extends EventEmitter {
  isOpen = false;
  close = vi.fn(async () => {
    this.isOpen = false;
  });
  connect = vi.fn(async () => {
    this.isOpen = true;
    return this;
  });
  del = vi.fn(async () => 1);
  destroy = vi.fn(() => {
    this.isOpen = false;
  });
  get = vi.fn(async (): Promise<null | string> => "value");
  ping = vi.fn(async () => "PONG");
  set = vi.fn(async () => "OK");
  setEx = vi.fn(async () => "OK");
}

const config: RedisClientConfig = {
  commandTimeoutMs: 2_000,
  connectTimeoutMs: 20_000,
  endpoint: "redis.example:10000",
};

let clusters: FakeCluster[];
let nextClusterSetup: ((cluster: FakeCluster) => void)[];

beforeEach(() => {
  vi.useFakeTimers();
  clusters = [];
  nextClusterSetup = [];
  vi.mocked(createCluster).mockImplementation((() => {
    const cluster = new FakeCluster();
    nextClusterSetup.shift()?.(cluster);
    clusters.push(cluster);
    return cluster;
  }) as unknown as typeof createCluster);
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("createRedisClient", () => {
  it("should reject and destroy the cluster when connecting exceeds connectTimeoutMs", async () => {
    nextClusterSetup.push((cluster) =>
      cluster.connect.mockReturnValue(never()),
    );

    const rejection = rejectionOf(createRedisClient(config));
    await vi.advanceTimersByTimeAsync(20_000);

    await expect(rejection).resolves.toEqual(
      new Error("Redis connect timed out after 20000ms"),
    );
    expect(clusters[0]?.destroy).toHaveBeenCalledOnce();
  });

  it("should forward cluster and node errors to onError", async () => {
    const onError = vi.fn();
    await createRedisClient({ ...config, onError });

    clusters[0]?.emit("error", new Error("cluster"));
    clusters[0]?.emit("node-error", new Error("node"));

    expect(onError).toHaveBeenCalledWith(new Error("cluster"));
    expect(onError).toHaveBeenCalledWith(new Error("node"));
  });

  it("should fall back to destroy when closing hangs", async () => {
    const client = await createRedisClient(config);
    clusters[0]?.close.mockReturnValue(never());

    const closing = client.closeConnection();
    await vi.advanceTimersByTimeAsync(2_000);
    await closing;

    expect(clusters[0]?.destroy).toHaveBeenCalledOnce();
  });
});

describe("createResilientRedisClient", () => {
  it("should reuse the same connection across commands", async () => {
    const client = await createResilientRedisClient(config);

    await client.ping();
    await client.get("key");
    await client.set("key", "value");

    expect(createCluster).toHaveBeenCalledOnce();
    expect(clusters[0]?.ping).toHaveBeenCalledOnce();
    expect(clusters[0]?.get).toHaveBeenCalledWith("key");
    expect(clusters[0]?.set).toHaveBeenCalledWith("key", "value");
  });

  it("should rebuild the connection with destroy, never quit/close, when the cluster is closed", async () => {
    const client = await createResilientRedisClient(config);
    const first = clusters[0];
    if (first) first.isOpen = false;

    await expect(client.ping()).resolves.toBe("PONG");

    expect(createCluster).toHaveBeenCalledTimes(2);
    expect(first?.destroy).toHaveBeenCalledOnce();
    expect(first?.close).not.toHaveBeenCalled();
    expect(clusters[1]?.ping).toHaveBeenCalledOnce();
  });

  it("should reject a hanging command within commandTimeoutMs", async () => {
    const client = await createResilientRedisClient(config);
    clusters[0]?.get.mockReturnValue(never());

    const rejection = rejectionOf(client.get("key"));
    await vi.advanceTimersByTimeAsync(2_000);

    await expect(rejection).resolves.toEqual(
      new Error("Redis command timed out after 2000ms"),
    );
  });

  it("should rebuild the connection after consecutive failed commands", async () => {
    const client = await createResilientRedisClient(config);
    clusters[0]?.get.mockRejectedValue(new Error("socket closed"));

    for (let i = 0; i < 3; i++) {
      await expect(client.get("key")).rejects.toThrow("socket closed");
    }
    await expect(client.get("key")).resolves.toBe("value");

    expect(clusters[0]?.destroy).toHaveBeenCalledOnce();
    expect(clusters[1]?.get).toHaveBeenCalledOnce();
  });

  it("should reset the failure count after a successful command", async () => {
    const client = await createResilientRedisClient(config);
    clusters[0]?.get
      .mockRejectedValueOnce(new Error("socket closed"))
      .mockRejectedValueOnce(new Error("socket closed"))
      .mockResolvedValueOnce("value")
      .mockRejectedValueOnce(new Error("socket closed"))
      .mockRejectedValueOnce(new Error("socket closed"));

    for (let i = 0; i < 5; i++) {
      await client.get("key").catch(() => undefined);
    }
    await client.get("key");

    expect(createCluster).toHaveBeenCalledOnce();
  });

  it("should not stay blocked when a reconnection hangs", async () => {
    const client = await createResilientRedisClient(config);
    nextClusterSetup.push((cluster) =>
      cluster.connect.mockReturnValue(never()),
    );
    const first = clusters[0];
    if (first) first.isOpen = false;

    const rejection = rejectionOf(client.ping());
    await vi.advanceTimersByTimeAsync(2_000);
    await expect(rejection).resolves.toEqual(
      new Error("Redis command timed out after 2000ms"),
    );

    await vi.advanceTimersByTimeAsync(18_000);
    expect(clusters[1]?.destroy).toHaveBeenCalledOnce();

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(client.ping()).resolves.toBe("PONG");
    expect(clusters[2]?.ping).toHaveBeenCalledOnce();
  });

  it("should not run a command whose deadline expired while reconnecting", async () => {
    const client = await createResilientRedisClient(config);
    nextClusterSetup.push((cluster) =>
      cluster.connect.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 3_000));
        cluster.isOpen = true;
        return cluster;
      }),
    );
    const first = clusters[0];
    if (first) first.isOpen = false;

    const rejection = rejectionOf(client.set("key", "value"));
    await vi.advanceTimersByTimeAsync(3_000);

    await expect(rejection).resolves.toEqual(
      new Error("Redis command timed out after 2000ms"),
    );

    expect(clusters[1]?.isOpen).toBe(true);
    expect(clusters[1]?.set).not.toHaveBeenCalled();
  });

  it("should back off after a failed reconnection", async () => {
    const client = await createResilientRedisClient(config);
    nextClusterSetup.push((cluster) =>
      cluster.connect.mockRejectedValue(new Error("connection refused")),
    );
    const first = clusters[0];
    if (first) first.isOpen = false;

    await expect(client.ping()).rejects.toThrow("connection refused");
    await expect(client.ping()).rejects.toThrow(
      "Redis reconnection failed, retrying shortly",
    );
    expect(createCluster).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(1_000);
    await expect(client.ping()).resolves.toBe("PONG");
    expect(createCluster).toHaveBeenCalledTimes(3);
  });

  it("should reject commands after the connection is closed", async () => {
    const client = await createResilientRedisClient(config);

    await client.closeConnection();

    await expect(client.ping()).rejects.toThrow("Redis client is closed");
    expect(clusters[0]?.close).toHaveBeenCalledOnce();
    expect(createCluster).toHaveBeenCalledOnce();
  });
});
