import {
  createLocalJWKSet,
  exportJWK,
  generateKeyPair,
  type JWK,
  SignJWT,
} from "jose";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { createJoseArTokenRepository } from "../jose-ar-token.repository.js";

const PROD_ISSUER = "https://selfcare.pagopa.it";
const UAT_ISSUER = "https://uat.selfcare.pagopa.it";

const newIssuerKey = async (kid: string) => {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const jwk: JWK = { ...(await exportJWK(publicKey)), alg: "RS256", kid };
  return { jwk, kid, privateKey };
};

const setup = async () => {
  const prodKey = await newIssuerKey("prod-key");
  const uatKey = await newIssuerKey("uat-key");
  const jwksByUrl = new Map([
    [`${PROD_ISSUER}/.well-known/jwks.json`, { keys: [prodKey.jwk] }],
    [`${UAT_ISSUER}/.well-known/jwks.json`, { keys: [uatKey.jwk] }],
  ]);
  const createJwks = vi.fn((url: URL) => {
    const jwks = jwksByUrl.get(url.href);
    if (!jwks) throw new Error(`unexpected JWKS url ${url.href}`);
    return createLocalJWKSet(jwks);
  });
  const repository = createJoseArTokenRepository([PROD_ISSUER, UAT_ISSUER], {
    createJwks,
  });
  return { createJwks, prodKey, repository, uatKey };
};

const sign = (
  key: { kid: string; privateKey: CryptoKey },
  issuer: string,
  expiration: number | string = "5m",
  alg = "RS256",
) =>
  new SignJWT({ name: "Mario" })
    .setProtectedHeader({ alg, kid: key.kid })
    .setIssuer(issuer)
    .setExpirationTime(expiration)
    .sign(key.privateKey);

const nowSeconds = () => Math.floor(Date.now() / 1000);

describe("createJoseArTokenRepository", () => {
  it("should read the JWKS of each configured issuer", async () => {
    const { createJwks } = await setup();

    expect(createJwks.mock.calls.map(([url]) => url.href)).toEqual([
      `${PROD_ISSUER}/.well-known/jwks.json`,
      `${UAT_ISSUER}/.well-known/jwks.json`,
    ]);
  });

  it.each([
    ["prod", PROD_ISSUER],
    ["uat", UAT_ISSUER],
  ])("should accept a valid token from the %s issuer", async (_, issuer) => {
    const { prodKey, repository, uatKey } = await setup();
    const token = await sign(issuer === PROD_ISSUER ? prodKey : uatKey, issuer);

    const result = await repository.verifyToken(token);

    expect(result).toEqual(
      ok(expect.objectContaining({ iss: issuer, name: "Mario" })),
    );
  });

  it("should accept a token expired within the 5 seconds tolerance", async () => {
    const { prodKey, repository } = await setup();
    const token = await sign(prodKey, PROD_ISSUER, nowSeconds() - 3);

    const result = await repository.verifyToken(token);

    expect(result).toEqual(ok(expect.objectContaining({ name: "Mario" })));
  });

  it.each([
    [
      "expired beyond the tolerance",
      async (s: Awaited<ReturnType<typeof setup>>) =>
        sign(s.prodKey, PROD_ISSUER, nowSeconds() - 10),
    ],
    [
      "from an untrusted issuer",
      async (s: Awaited<ReturnType<typeof setup>>) =>
        sign(s.prodKey, "https://evil.example.com"),
    ],
    [
      "signed with another issuer's key",
      async (s: Awaited<ReturnType<typeof setup>>) =>
        sign(s.uatKey, PROD_ISSUER),
    ],
    [
      "with a tampered signature",
      async (s: Awaited<ReturnType<typeof setup>>) => {
        const token = await sign(s.prodKey, PROD_ISSUER);
        const [header, payload, signature] = token.split(".");
        const flipped = signature.startsWith("A") ? "B" : "A";
        return `${header}.${payload}.${flipped}${signature.slice(1)}`;
      },
    ],
    ["malformed", async () => Promise.resolve("not-a-jwt")],
    [
      "signed with a disallowed algorithm",
      async () =>
        new SignJWT({})
          .setProtectedHeader({ alg: "HS256" })
          .setIssuer(PROD_ISSUER)
          .setExpirationTime("5m")
          .sign(new TextEncoder().encode("secret-secret-secret-secret-secret")),
    ],
    [
      "without expiration",
      async (s: Awaited<ReturnType<typeof setup>>) =>
        new SignJWT({})
          .setProtectedHeader({ alg: "RS256", kid: s.prodKey.kid })
          .setIssuer(PROD_ISSUER)
          .sign(s.prodKey.privateKey),
    ],
  ])("should reject a token %s", async (_, makeToken) => {
    const state = await setup();
    const token = await makeToken(state);

    const result = await state.repository.verifyToken(token);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "UnauthorizedError" })),
    );
  });

  it("should return ServiceUnavailableError when the JWKS cannot be retrieved", async () => {
    const { prodKey } = await setup();
    const repository = createJoseArTokenRepository([PROD_ISSUER], {
      createJwks: () => () => Promise.reject(new TypeError("fetch failed")),
    });
    const token = await sign(prodKey, PROD_ISSUER);

    const result = await repository.verifyToken(token);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ServiceUnavailableError" })),
    );
  });
});
