import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

vi.mock("../saml.js", () => ({
  getFiscalCodeFromAssertion: vi.fn(),
  getInResponseToFromAssertion: vi.fn(),
  getIssueInstantFromAssertion: vi.fn(),
  parseAssertionXml: vi.fn(),
  verifyAssertionSignatures: vi.fn(),
}));

vi.mock("../thumbprint.js", () => ({
  calculateThumbprint: vi.fn(),
  getAlgoFromAssertionRef: vi.fn(),
}));

vi.mock("../http-signature.js", () => ({
  verifyHttpSignature: vi.fn(),
  verifyStateInSignature: vi.fn(),
}));

import { err } from "neverthrow";

import {
  verifyHttpSignature,
  verifyStateInSignature,
} from "../http-signature.js";
import { createLollipopVerifier } from "../lollipop.js";
import {
  getFiscalCodeFromAssertion,
  getInResponseToFromAssertion,
  getIssueInstantFromAssertion,
  parseAssertionXml,
  verifyAssertionSignatures,
} from "../saml.js";
import { calculateThumbprint, getAlgoFromAssertionRef } from "../thumbprint.js";

const mockVerifyAssertionSignatures = vi.mocked(verifyAssertionSignatures);
const mockParseAssertionXml = vi.mocked(parseAssertionXml);
const mockGetAlgoFromAssertionRef = vi.mocked(getAlgoFromAssertionRef);
const mockCalculateThumbprint = vi.mocked(calculateThumbprint);
const mockGetInResponseToFromAssertion = vi.mocked(
  getInResponseToFromAssertion,
);
const mockGetFiscalCodeFromAssertion = vi.mocked(getFiscalCodeFromAssertion);
const mockGetIssueInstantFromAssertion = vi.mocked(
  getIssueInstantFromAssertion,
);
const mockVerifyHttpSignature = vi.mocked(verifyHttpSignature);
const mockVerifyStateInSignature = vi.mocked(verifyStateInSignature);

// A valid public_key must be a Base64-encoded JSON JWK
const PUBLIC_KEY_JWK = { crv: "P-256", kty: "EC", x: "abc", y: "def" };
const PUBLIC_KEY_B64 = Buffer.from(JSON.stringify(PUBLIC_KEY_JWK)).toString(
  "base64",
);

const VALID_USER = {
  assertion: "<saml/>",
  assertion_ref: "sha256-abc123",
  family_name: "Rossi",
  fiscal_code: "RSSMRA80A01H501T",
  given_name: "Mario",
  public_key: PUBLIC_KEY_B64,
};

const STATE = "state-hex";
const FCB_URL = "https://example.com/fcb";
const IDP_URL = "https://idp.example.com";

const LOLLIPOP_HEADERS = {
  signature: "sig1=:abc:",
  "signature-input": `sig1=();nonce="${STATE}";keyid="${VALID_USER.assertion_ref}"`,
};

const MOCK_DOC = {} as Document;
const FUTURE_DATE = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365);

const setupHappyPath = (): void => {
  mockVerifyAssertionSignatures.mockResolvedValue(ok(undefined));
  mockParseAssertionXml.mockReturnValue(ok(MOCK_DOC));
  mockGetAlgoFromAssertionRef.mockReturnValue("sha256");
  mockCalculateThumbprint.mockResolvedValue(ok("abc123"));
  mockGetInResponseToFromAssertion.mockReturnValue(VALID_USER.assertion_ref);
  mockGetFiscalCodeFromAssertion.mockReturnValue(VALID_USER.fiscal_code);
  mockGetIssueInstantFromAssertion.mockReturnValue(FUTURE_DATE);
  mockVerifyHttpSignature.mockResolvedValue(ok(true));
  mockVerifyStateInSignature.mockReturnValue(ok(true));
};

describe("verifyLollipop", () => {
  it("returns ok(true) when all steps pass", async () => {
    setupHappyPath();
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isOk()).toBe(true);
  });

  it("fails at step 1 — assertion signature verification fails", async () => {
    setupHappyPath();
    mockVerifyAssertionSignatures.mockResolvedValue(
      err(new UnauthorizedError("sig failed")),
    );
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 2 — invalid base64 public_key", async () => {
    setupHappyPath();
    const badUser = { ...VALID_USER, public_key: "not-valid-base64-json!!!" };
    const result = await createLollipopVerifier().verify(
      badUser,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 3 — parseAssertionXml fails", async () => {
    setupHappyPath();
    mockParseAssertionXml.mockReturnValue(
      err(new UnauthorizedError("xml error")),
    );
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 4 — thumbprint mismatch", async () => {
    setupHappyPath();
    mockCalculateThumbprint.mockResolvedValue(ok("different-hash"));
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 5 — InResponseTo not found", async () => {
    setupHappyPath();
    mockGetInResponseToFromAssertion.mockReturnValue(null);
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 6 — fiscal code mismatch", async () => {
    setupHappyPath();
    mockGetFiscalCodeFromAssertion.mockReturnValue("ANOTHERFC0000000");
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 7 — expired assertion (IssueInstant older than 1 year)", async () => {
    setupHappyPath();
    mockGetIssueInstantFromAssertion.mockReturnValue(
      new Date("2000-01-01T00:00:00Z"),
    );
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 8 — HTTP signature verification fails", async () => {
    setupHappyPath();
    mockVerifyHttpSignature.mockResolvedValue(
      err(new UnauthorizedError("bad sig")),
    );
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });

  it("fails at step 9 — nonce/state mismatch in signature-input", async () => {
    setupHappyPath();
    mockVerifyStateInSignature.mockReturnValue(
      err(new UnauthorizedError("nonce mismatch")),
    );
    const result = await createLollipopVerifier().verify(
      VALID_USER,
      LOLLIPOP_HEADERS,
      STATE,
      FCB_URL,
      IDP_URL,
    );
    expect(result.isErr()).toBe(true);
  });
});
