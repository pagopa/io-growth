import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { RedisCommands } from "../client.js";

import { del, get, set, setEx } from "../operations.js";

const createMockClient = () => {
  const mock = {
    del: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    setEx: vi.fn(),
  };
  return mock as RedisCommands & typeof mock;
};

describe("set", () => {
  it("should serialize value as JSON and call client.set", async () => {
    const client = createMockClient();
    client.set.mockResolvedValue("OK");

    const result = await set(client, "key1", { name: "test" });

    expect(result).toEqual(ok(undefined));
    expect(client.set).toHaveBeenCalledWith("key1", '{"name":"test"}');
  });

  it("should return GenericError when client.set throws", async () => {
    const client = createMockClient();
    client.set.mockRejectedValue(new Error("connection lost"));

    const result = await set(client, "key1", { name: "test" });

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "GenericError",
          message: expect.stringContaining("Redis SET failed"),
        }),
      ),
    );
  });
});

describe("setEx", () => {
  it("should serialize value as JSON and call client.setEx with TTL", async () => {
    const client = createMockClient();
    client.setEx.mockResolvedValue("OK");

    const result = await setEx(client, "key2", { id: 1 }, 60);

    expect(result).toEqual(ok(undefined));
    expect(client.setEx).toHaveBeenCalledWith("key2", 60, '{"id":1}');
  });

  it("should return GenericError when client.setEx throws", async () => {
    const client = createMockClient();
    client.setEx.mockRejectedValue(new Error("timeout"));

    const result = await setEx(client, "key2", { id: 1 }, 60);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "GenericError",
          message: expect.stringContaining("Redis SETEX failed"),
        }),
      ),
    );
  });
});

describe("get", () => {
  it("should return parsed JSON value when key exists", async () => {
    const client = createMockClient();
    client.get.mockResolvedValue('{"name":"test","age":30}');

    const result = await get<{ age: number; name: string }>(client, "key3");

    expect(result).toEqual(ok({ age: 30, name: "test" }));
  });

  it("should return null when key does not exist", async () => {
    const client = createMockClient();
    client.get.mockResolvedValue(null);

    const result = await get(client, "missing-key");

    expect(result).toEqual(ok(null));
  });

  it("should return GenericError when client.get throws", async () => {
    const client = createMockClient();
    client.get.mockRejectedValue(new Error("connection refused"));

    const result = await get(client, "key3");

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "GenericError",
          message: expect.stringContaining("Redis GET failed"),
        }),
      ),
    );
  });

  it("should return GenericError when JSON.parse fails", async () => {
    const client = createMockClient();
    client.get.mockResolvedValue("not-valid-json");

    const result = await get(client, "bad-json");

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "GenericError",
          message: expect.stringContaining("Redis GET failed"),
        }),
      ),
    );
  });
});

describe("del", () => {
  it("should call client.del with the key", async () => {
    const client = createMockClient();
    client.del.mockResolvedValue(1);

    const result = await del(client, "key4");

    expect(result).toEqual(ok(undefined));
    expect(client.del).toHaveBeenCalledWith("key4");
  });

  it("should return GenericError when client.del throws", async () => {
    const client = createMockClient();
    client.del.mockRejectedValue(new Error("network error"));

    const result = await del(client, "key4");

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "GenericError",
          message: expect.stringContaining("Redis DEL failed"),
        }),
      ),
    );
  });
});
