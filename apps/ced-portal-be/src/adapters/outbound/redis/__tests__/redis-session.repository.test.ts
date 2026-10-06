import type { RedisCommands } from "@pagopa/io-core-adapter-redis";

import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { SESSION_TTL_SECONDS } from "../../../../domain/entities/session.js";
import { createRedisSessionRepository } from "../redis-session.repository.js";

const OPERATOR_EXTERNAL_ID = "2986aaaa-0000-4000-8000-000000000001";

const createMockRedisClient = (
  overrides: Partial<RedisCommands> = {},
): RedisCommands => ({
  del: overrides.del ?? vi.fn().mockResolvedValue(1),
  get: overrides.get ?? vi.fn().mockResolvedValue(null),
  ping: overrides.ping ?? vi.fn().mockResolvedValue("PONG"),
  set: overrides.set ?? vi.fn().mockResolvedValue("OK"),
  setEx: overrides.setEx ?? vi.fn().mockResolvedValue("OK"),
});

describe("createRedisSessionRepository — revocation tombstone TTL", () => {
  it("should outlive any session the revocation has to cover", async () => {
    const client = createMockRedisClient();
    const repository = createRedisSessionRepository(client);

    const result =
      await repository.revokeByOperatorExternalId(OPERATOR_EXTERNAL_ID);

    expect(result).toEqual(ok(undefined));
    expect(client.setEx).toHaveBeenCalledOnce();

    const [key, ttlSeconds, value] = (client.setEx as ReturnType<typeof vi.fn>)
      .mock.calls[0] as [string, number, string];

    expect(key).toBe(`revoked-operator:${OPERATOR_EXTERNAL_ID}`);
    expect(value).toBe("true");
    expect(ttlSeconds).toBeGreaterThanOrEqual(SESSION_TTL_SECONDS);
  });
});
