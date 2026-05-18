import { UnauthorizedError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

vi.mock("openid-client", () => {
  const mockClient = {
    authorizationUrl: vi.fn(),
    callback: vi.fn(),
    userinfo: vi.fn(),
  };
  const MockIssuer = {
    Client: class {
      authorizationUrl = mockClient.authorizationUrl;
      callback = mockClient.callback;
      userinfo = mockClient.userinfo;
    },
    discover: vi.fn().mockResolvedValue({
      Client: class {
        authorizationUrl = mockClient.authorizationUrl;
        callback = mockClient.callback;
        userinfo = mockClient.userinfo;
      },
    }),
  };
  return { __mockClient: mockClient, Issuer: MockIssuer };
});

import * as openidClient from "openid-client";

import { createOidcClient } from "../oidc-client.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockClient = (openidClient as any).__mockClient as {
  authorizationUrl: ReturnType<typeof vi.fn>;
  callback: ReturnType<typeof vi.fn>;
  userinfo: ReturnType<typeof vi.fn>;
};

const OIDC_CONFIG = {
  clientId: "client-id",
  clientSecret: "secret",
  issuerUrl: "https://fims.example.com",
  redirectUri: "https://app.example.com/fcb",
  scope: "openid profile",
};

const MOCK_TOKEN_RESPONSE = { access_token: "tok" };

const VALID_USERINFO = {
  assertion: "<saml/>",
  assertion_ref: "sha256-abc123def",
  family_name: "Rossi",
  fiscal_code: "RSSMRA80A01H501T",
  given_name: "Mario",
  public_key: "eyJrdHkiOiJFQyJ9",
};

describe("createOidcClient.exchangeCode", () => {
  it("returns ok(FimsUser) when userinfo is valid", async () => {
    mockClient.callback.mockResolvedValue(MOCK_TOKEN_RESPONSE);
    mockClient.userinfo.mockResolvedValue(VALID_USERINFO);

    const client = createOidcClient(OIDC_CONFIG);
    const result = await client.exchangeCode(
      "code",
      "state",
      "nonce",
      OIDC_CONFIG.issuerUrl,
    );

    expect(result).toEqual(
      ok(expect.objectContaining({ fiscal_code: "RSSMRA80A01H501T" })),
    );
  });

  it("returns UnauthorizedError when assertion_ref format is invalid", async () => {
    mockClient.callback.mockResolvedValue(MOCK_TOKEN_RESPONSE);
    mockClient.userinfo.mockResolvedValue({
      ...VALID_USERINFO,
      assertion_ref: "invalid-format",
    });

    const client = createOidcClient(OIDC_CONFIG);
    const result = await client.exchangeCode(
      "code",
      "state",
      "nonce",
      OIDC_CONFIG.issuerUrl,
    );

    expect(result).toEqual(err(expect.any(UnauthorizedError)));
  });

  it("returns UnauthorizedError when fiscal_code format is invalid", async () => {
    mockClient.callback.mockResolvedValue(MOCK_TOKEN_RESPONSE);
    mockClient.userinfo.mockResolvedValue({
      ...VALID_USERINFO,
      fiscal_code: "TOOSHORT",
    });

    const client = createOidcClient(OIDC_CONFIG);
    const result = await client.exchangeCode(
      "code",
      "state",
      "nonce",
      OIDC_CONFIG.issuerUrl,
    );

    expect(result).toEqual(err(expect.any(UnauthorizedError)));
  });

  it("returns UnauthorizedError when required string fields are missing", async () => {
    mockClient.callback.mockResolvedValue(MOCK_TOKEN_RESPONSE);
    mockClient.userinfo.mockResolvedValue({
      assertion_ref: "sha256-abc",
      fiscal_code: "RSSMRA80A01H501T",
      // missing assertion, public_key, family_name, given_name
    });

    const client = createOidcClient(OIDC_CONFIG);
    const result = await client.exchangeCode(
      "code",
      "state",
      "nonce",
      OIDC_CONFIG.issuerUrl,
    );

    expect(result.isErr()).toBe(true);
  });

  it("returns UnauthorizedError when no access token is returned", async () => {
    mockClient.callback.mockResolvedValue({ access_token: undefined });
    mockClient.userinfo.mockResolvedValue(VALID_USERINFO);

    const client = createOidcClient(OIDC_CONFIG);
    const result = await client.exchangeCode(
      "code",
      "state",
      "nonce",
      OIDC_CONFIG.issuerUrl,
    );

    expect(result.isErr()).toBe(true);
  });
});
