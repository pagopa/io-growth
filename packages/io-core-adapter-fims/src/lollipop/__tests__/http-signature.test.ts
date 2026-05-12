import type { JWK } from "jose";

import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { describe, expect, it, vi } from "vitest";

// We mock the @mattrglobal/http-signatures module to control what
// verifySignatureHeader returns without needing a real crypto setup.
vi.mock("@mattrglobal/http-signatures", () => ({
  verifySignatureHeader: vi.fn(),
}));

import { verifySignatureHeader } from "@mattrglobal/http-signatures";

import {
  verifyHttpSignature,
  verifyStateInSignature,
} from "../http-signature.js";

const mockVerifySignatureHeader = vi.mocked(verifySignatureHeader);

const SAMPLE_JWK: JWK = {
  crv: "P-256",
  kty: "EC",
  x: "f83OJ3D2xF1Bg8vub9tLe1gHMzV76e8Tus9uPHvRVEU",
  y: "x_FEzRu9m36HLN_tue659LNpXW6pCyStikYjKIWI5a0",
};

const SAMPLE_HEADERS = {
  signature: "sig1=:abc:",
  "signature-input":
    'sig1=("@method" "@target-uri");nonce="test-state-hex";keyid="sha256-abc123"',
};

describe("verifyHttpSignature", () => {
  it("returns ok(true) when verifySignatureHeader succeeds and is verified", async () => {
    mockVerifySignatureHeader.mockResolvedValue({
      isErr: () => false,
      value: { verified: true },
    } as never);

    const result = await verifyHttpSignature(
      "sha256-abc123",
      SAMPLE_HEADERS,
      "https://example.com/fcb",
      SAMPLE_JWK,
    );

    expect(result.isOk()).toBe(true);
  });

  it("returns UnauthorizedError when verifySignatureHeader returns err", async () => {
    mockVerifySignatureHeader.mockResolvedValue({
      error: { message: "parse error" },
      isErr: () => true,
    } as never);

    const result = await verifyHttpSignature(
      "sha256-abc123",
      SAMPLE_HEADERS,
      "https://example.com/fcb",
      SAMPLE_JWK,
    );

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError);
  });

  it("returns UnauthorizedError when signature is not verified", async () => {
    mockVerifySignatureHeader.mockResolvedValue({
      isErr: () => false,
      value: { reason: "keyid mismatch", verified: false },
    } as never);

    const result = await verifyHttpSignature(
      "sha256-abc123",
      SAMPLE_HEADERS,
      "https://example.com/fcb",
      SAMPLE_JWK,
    );

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError);
  });
});

describe("verifyStateInSignature", () => {
  it("returns ok(true) when state is present as nonce in signature-input", () => {
    const signatureInput =
      'sig1=("@method" "@target-uri");nonce="expected-state";keyid="sha256-abc"';
    const result = verifyStateInSignature(signatureInput, "expected-state");
    expect(result.isOk()).toBe(true);
  });

  it("returns UnauthorizedError when state is absent from signature-input", () => {
    const signatureInput =
      'sig1=("@method");nonce="other-state";keyid="sha256-abc"';
    const result = verifyStateInSignature(signatureInput, "expected-state");
    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(UnauthorizedError);
  });

  it("returns UnauthorizedError when signature-input is empty", () => {
    const result = verifyStateInSignature("", "expected-state");
    expect(result.isErr()).toBe(true);
  });
});
