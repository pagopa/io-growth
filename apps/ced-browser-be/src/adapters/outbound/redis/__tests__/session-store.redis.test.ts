import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

vi.mock("@pagopa/io-core-adapter-redis", () => ({
  del: vi.fn(),
  get: vi.fn(),
  setEx: vi.fn(),
}));

import { del, get, setEx } from "@pagopa/io-core-adapter-redis";

import { createRedisSessionStore } from "../session-store.redis.js";

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

describe("createRedisSessionStore (browser — key prefix 'browser:')", () => {
  it("storeSession prefixes key with 'browser:session:'", async () => {
    mockSetEx.mockResolvedValue(ok(undefined));
    const store = createRedisSessionStore(fakeClient);
    await store.storeSession("token-abc", SESSION, 1800);
    expect(mockSetEx).toHaveBeenCalledWith(
      fakeClient,
      "browser:session:token-abc",
      SESSION,
      1800,
    );
  });

  it("getSession prefixes key with 'browser:session:'", async () => {
    mockGet.mockResolvedValue(ok(SESSION));
    const store = createRedisSessionStore(fakeClient);
    const result = await store.getSession("token-abc");
    expect(mockGet).toHaveBeenCalledWith(
      fakeClient,
      "browser:session:token-abc",
    );
    expect(result._unsafeUnwrap()).toEqual(SESSION);
  });

  it("storeTemporary prefixes key with 'browser:'", async () => {
    mockSetEx.mockResolvedValue(ok(undefined));
    const store = createRedisSessionStore(fakeClient);
    await store.storeTemporary("nonce:state-hex", "nonce-value", 60);
    expect(mockSetEx).toHaveBeenCalledWith(
      fakeClient,
      "browser:nonce:state-hex",
      "nonce-value",
      60,
    );
  });

  it("getTemporary prefixes key with 'browser:'", async () => {
    mockGet.mockResolvedValue(ok("nonce-value"));
    const store = createRedisSessionStore(fakeClient);
    const result = await store.getTemporary("nonce:state-hex");
    expect(mockGet).toHaveBeenCalledWith(fakeClient, "browser:nonce:state-hex");
    expect(result._unsafeUnwrap()).toBe("nonce-value");
  });

  it("deleteTemporary prefixes key with 'browser:'", async () => {
    mockDel.mockResolvedValue(ok(undefined));
    const store = createRedisSessionStore(fakeClient);
    await store.deleteTemporary("nonce:state-hex");
    expect(mockDel).toHaveBeenCalledWith(fakeClient, "browser:nonce:state-hex");
  });

  it("getSession propagates errors from redis", async () => {
    mockGet.mockResolvedValue(err(new GenericError("redis down")));
    const store = createRedisSessionStore(fakeClient);
    const result = await store.getSession("token-abc");
    expect(result.isErr()).toBe(true);
  });
});
