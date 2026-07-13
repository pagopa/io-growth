import { decodeJwt, decodeProtectedHeader, generateKeyPair } from "jose";
import { beforeAll, describe, expect, it } from "vitest";

import type { SigningCredentials } from "../../../../domain/ports/outbound/credential-provider.port.js";

import { createTokenSigner } from "../jose-token-signer.js";

let credentials: SigningCredentials;

const FAKE_X5C = ["MIIFAKE1BASE64==", "MIIFAKE2BASE64=="];

beforeAll(async () => {
  const { privateKey } = await generateKeyPair("RS256");
  credentials = { privateKey, x5c: FAKE_X5C };
});

const baseParams = {
  audience: "urn:inps:api:gestione-ced",
  codiceUfficio: "UFFICIO01",
  contentType: "application/json",
  digest: "SHA-256=abc123==",
  issuer: "pagopa-ente-01",
  userId: "RSSMRA80A01H501U",
};

describe("createTokenSigner.signRequest", () => {
  it("returns ok with a jwt string and a jti", async () => {
    const signer = createTokenSigner(credentials);
    const result = await signer.signRequest(baseParams);

    expect(result.isOk()).toBe(true);
    const { jti, jwt } = result._unsafeUnwrap();
    expect(typeof jwt).toBe("string");
    expect(typeof jti).toBe("string");
    // jti is a UUID
    expect(jti).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it("sets alg=RS256 and x5c in the protected header", async () => {
    const signer = createTokenSigner(credentials);
    const { jwt } = (await signer.signRequest(baseParams))._unsafeUnwrap();
    const header = decodeProtectedHeader(jwt);

    expect(header.alg).toBe("RS256");
    expect(header.x5c).toEqual(FAKE_X5C);
  });

  it("embeds iss, sub, aud, jti in the payload", async () => {
    const signer = createTokenSigner(credentials);
    const { jti, jwt } = (await signer.signRequest(baseParams))._unsafeUnwrap();
    const payload = decodeJwt(jwt);

    expect(payload.iss).toBe(baseParams.issuer);
    expect(payload.sub).toBe(baseParams.issuer);
    expect(payload.aud).toContain(baseParams.audience);
    expect(payload.jti).toBe(jti);
  });

  it("embeds iat, nbf and exp (5 minutes window)", async () => {
    const before = Math.floor(Date.now() / 1000);
    const signer = createTokenSigner(credentials);
    const { jwt } = (await signer.signRequest(baseParams))._unsafeUnwrap();
    const after = Math.floor(Date.now() / 1000);
    const payload = decodeJwt(jwt);

    expect(payload.iat).toBeGreaterThanOrEqual(before);
    expect(payload.iat).toBeLessThanOrEqual(after);
    expect(payload.nbf).toEqual(payload.iat);
    expect(payload.exp).toBeCloseTo((payload.iat as number) + 300, -1);
  });

  it("embeds digest, content-type and identity claims", async () => {
    const signer = createTokenSigner(credentials);
    const { jwt } = (await signer.signRequest(baseParams))._unsafeUnwrap();
    const payload = decodeJwt(jwt);

    expect(payload["digest"]).toBe(baseParams.digest);
    expect(payload["content-type"]).toBe(baseParams.contentType);
    expect(payload["inps-identity-userid"]).toBe(baseParams.userId);
    expect(payload["inps-identity-codiceufficio"]).toBe(
      baseParams.codiceUfficio,
    );
  });

  it("sets signed_headers covering digest, content-type and identity headers", async () => {
    const signer = createTokenSigner(credentials);
    const { jwt } = (await signer.signRequest(baseParams))._unsafeUnwrap();
    const payload = decodeJwt(jwt);

    const signedHeaders = String(payload["signed_headers"]);
    expect(signedHeaders).toContain("digest");
    expect(signedHeaders).toContain("content-type");
    expect(signedHeaders).toContain("inps-identity-userid");
    expect(signedHeaders).toContain("inps-identity-codiceufficio");
  });

  it("returns err(GenericError) when signing fails (null key)", async () => {
    // Force a bad private key to trigger the catch branch
    const badCredentials = {
      privateKey: null as unknown as SigningCredentials["privateKey"],
      x5c: FAKE_X5C,
    };
    const signer = createTokenSigner(badCredentials);
    const result = await signer.signRequest(baseParams);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr().kind).toBe("GenericError");
  });
});
