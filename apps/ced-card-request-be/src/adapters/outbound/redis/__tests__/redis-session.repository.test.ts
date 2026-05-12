import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pagopa/io-core-adapter-redis", () => ({
  del: vi.fn(),
  get: vi.fn(),
  setEx: vi.fn(),
}));

import { del, get, setEx } from "@pagopa/io-core-adapter-redis";

import { createRedisSessionRepository } from "../redis-session.repository.js";

const mockGet = vi.mocked(get);
const mockSetEx = vi.mocked(setEx);
const mockDel = vi.mocked(del);

// Fake RedisCommands object — functions are never called directly (mocked at module level)
const fakeClient = {} as never;

const SESSION = {
  familyName: "Rossi",
  fiscalCode: "RSSMRA80A01H501T",
  givenName: "Mario",
};

describe("createRedisSessionRepository (card — key prefix 'card:')", () => {
  it("storeSession prefixes key with 'card:session:'", async () => {
    mockSetEx.mockResolvedValue(ok(undefined));
    const store = createRedisSessionRepository(fakeClient);
    await store.storeSession("token-abc", SESSION, 1800);
    expect(mockSetEx).toHaveBeenCalledWith(
      fakeClient,
      "card:session:token-abc",
      SESSION,
      1800,
    );
  });

  it("getSession prefixes key with 'card:session:'", async () => {
    mockGet.mockResolvedValue(ok(SESSION));
    const store = createRedisSessionRepository(fakeClient);
    const result = await store.getSession("token-abc");
    expect(mockGet).toHaveBeenCalledWith(fakeClient, "card:session:token-abc");
    expect(result._unsafeUnwrap()).toEqual(SESSION);
  });

  it("storeTemporary prefixes key with 'card:'", async () => {
    mockSetEx.mockResolvedValue(ok(undefined));
    const store = createRedisSessionRepository(fakeClient);
    await store.storeTemporary("nonce:state-hex", "nonce-value", 60);
    expect(mockSetEx).toHaveBeenCalledWith(
      fakeClient,
      "card:nonce:state-hex",
      "nonce-value",
      60,
    );
  });

  it("getTemporary prefixes key with 'card:'", async () => {
    mockGet.mockResolvedValue(ok("nonce-value"));
    const store = createRedisSessionRepository(fakeClient);
    const result = await store.getTemporary("nonce:state-hex");
    expect(mockGet).toHaveBeenCalledWith(fakeClient, "card:nonce:state-hex");
    expect(result._unsafeUnwrap()).toBe("nonce-value");
  });

  it("deleteTemporary prefixes key with 'card:'", async () => {
    mockDel.mockResolvedValue(ok(undefined));
    const store = createRedisSessionRepository(fakeClient);
    await store.deleteTemporary("nonce:state-hex");
    expect(mockDel).toHaveBeenCalledWith(fakeClient, "card:nonce:state-hex");
  });

  it("getSession propagates errors from redis", async () => {
    mockGet.mockResolvedValue(err(new GenericError("redis down")));
    const store = createRedisSessionRepository(fakeClient);
    const result = await store.getSession("token-abc");
    expect(result.isErr()).toBe(true);
  });
});
