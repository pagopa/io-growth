import { describe, expect, it, vi } from "vitest";

import type { RedisCommands } from "../client.js";

import { redisDel, redisGet, redisSet, redisSetEx } from "../operations.js";

const createMockClient = () => {
  const mock = {
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    setEx: vi.fn(),
  };
  return mock as RedisCommands & typeof mock;
};

describe("redisSet", () => {
  it("should serialize value as JSON and call client.set", async () => {
    const client = createMockClient();
    client.set.mockResolvedValue("OK");

    const result = await redisSet(client, "key1", { name: "test" });

    expect(result.isOk()).toBe(true);
    expect(client.set).toHaveBeenCalledWith("key1", '{"name":"test"}');
  });

  it("should return GenericError when client.set throws", async () => {
    const client = createMockClient();
    client.set.mockRejectedValue(new Error("connection lost"));

    const result = await redisSet(client, "key1", { name: "test" });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
    expect(result._unsafeUnwrapErr().message).toContain("Redis SET failed");
  });
});

describe("redisSetEx", () => {
  it("should serialize value as JSON and call client.setEx with TTL", async () => {
    const client = createMockClient();
    client.setEx.mockResolvedValue("OK");

    const result = await redisSetEx(client, "key2", { id: 1 }, 60);

    expect(result.isOk()).toBe(true);
    expect(client.setEx).toHaveBeenCalledWith("key2", 60, '{"id":1}');
  });

  it("should return GenericError when client.setEx throws", async () => {
    const client = createMockClient();
    client.setEx.mockRejectedValue(new Error("timeout"));

    const result = await redisSetEx(client, "key2", { id: 1 }, 60);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
    expect(result._unsafeUnwrapErr().message).toContain("Redis SETEX failed");
  });
});

describe("redisGet", () => {
  it("should return parsed JSON value when key exists", async () => {
    const client = createMockClient();
    client.get.mockResolvedValue('{"name":"test","age":30}');

    const result = await redisGet<{ age: number; name: string }>(
      client,
      "key3",
    );

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual({ age: 30, name: "test" });
  });

  it("should return null when key does not exist", async () => {
    const client = createMockClient();
    client.get.mockResolvedValue(null);

    const result = await redisGet(client, "missing-key");

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toBeNull();
  });

  it("should return GenericError when client.get throws", async () => {
    const client = createMockClient();
    client.get.mockRejectedValue(new Error("connection refused"));

    const result = await redisGet(client, "key3");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
    expect(result._unsafeUnwrapErr().message).toContain("Redis GET failed");
  });

  it("should return GenericError when JSON.parse fails", async () => {
    const client = createMockClient();
    client.get.mockResolvedValue("not-valid-json");

    const result = await redisGet(client, "bad-json");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
    expect(result._unsafeUnwrapErr().message).toContain("Redis GET failed");
  });
});

describe("redisDel", () => {
  it("should call client.del with the key", async () => {
    const client = createMockClient();
    client.del.mockResolvedValue(1);

    const result = await redisDel(client, "key4");

    expect(result.isOk()).toBe(true);
    expect(client.del).toHaveBeenCalledWith("key4");
  });

  it("should return GenericError when client.del throws", async () => {
    const client = createMockClient();
    client.del.mockRejectedValue(new Error("network error"));

    const result = await redisDel(client, "key4");

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
    expect(result._unsafeUnwrapErr().message).toContain("Redis DEL failed");
  });
});
