import type { CosmosClient } from "@azure/cosmos";
import type { SignedFetch } from "@pagopa/io-core-adapter-modi";

import { hashFiscalCode } from "@pagopa/io-core-domain/utilities";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { AppConfig } from "../config.js";
import type { InpsEnvironment } from "../routed-clients.js";

import { createSessionContextPreHandler } from "../async-local-storage-session-context.js";
import {
  createDbRouter,
  createInpsEnvironmentRouter,
} from "../routed-clients.js";

vi.mock("@pagopa/io-core-adapter-tracing", () => ({
  emitCustomEvent: () => () => undefined,
}));

const TEST_FISCAL_CODE = "RSSMRA80A01H501U";
const TEST_USERS = [hashFiscalCode(TEST_FISCAL_CODE)];

const config = {
  COSMOS_CONTAINER_NAME: "prod_container",
  COSMOS_CONTAINER_NAME_TEST: "test_container",
  COSMOS_DATABASE_NAME: "records_db",
} as AppConfig;

const cosmosClient = {
  database: (databaseName: string) => ({
    container: (containerName: string) => ({ containerName, databaseName }),
  }),
} as unknown as CosmosClient;

const sessionFor = (fiscalCode: string) =>
  createSessionContextPreHandler(() =>
    Promise.resolve(
      ok({ familyName: "Rossi", fiscalCode, givenName: "Mario" }),
    ),
  );

const inject = async <T>(
  fiscalCode: string | undefined,
  read: () => Promise<T> | T,
): Promise<T> => {
  const app = Fastify();
  if (fiscalCode !== undefined) {
    app.addHook("preHandler", sessionFor(fiscalCode));
  }
  app.get("/", async () => ({ value: await read() }));
  const response = await app.inject({ method: "GET", url: "/" });
  return (response.json() as { value: T }).value;
};

describe("createDbRouter", () => {
  const container = (appConfig: AppConfig = config) =>
    createDbRouter(
      appConfig,
      cosmosClient,
      TEST_USERS,
    ).getInstance() as unknown as {
      containerName: string;
      databaseName: string;
    };

  it("routes a listed test user to the test container", async () => {
    const db = container();
    await expect(
      inject(TEST_FISCAL_CODE, () => db.containerName),
    ).resolves.toBe("test_container");
  });

  it("routes an unlisted citizen to the prod container", async () => {
    const db = container();
    await expect(
      inject("GLLGLL80A01H501V", () => db.containerName),
    ).resolves.toBe("prod_container");
  });

  it("routes requests without a session to the prod container", async () => {
    const db = container();
    await expect(inject(undefined, () => db.containerName)).resolves.toBe(
      "prod_container",
    );
  });

  it("keeps the same database for both environments", async () => {
    const db = container();
    await expect(inject(TEST_FISCAL_CODE, () => db.databaseName)).resolves.toBe(
      "records_db",
    );
  });
});

describe("createInpsEnvironmentRouter", () => {
  const environment = (name: string) => {
    const signedFetch = vi.fn(() =>
      Promise.resolve(ok(new Response("{}", { status: 200 }))),
    );
    const inpsEnvironment: InpsEnvironment = {
      config: { audience: `aud-${name}`, baseUrl: `https://${name}.inps.test` },
      defaultCodiceUfficio: `ufficio-${name}`,
      signedFetch: signedFetch as unknown as SignedFetch,
    };
    return { inpsEnvironment, signedFetch };
  };

  // Calls the routed client and reports which environment served the request.
  const callCheckDomanda = async (fiscalCode: string | undefined) => {
    const prod = environment("prod");
    const test = environment("test");
    const client = createInpsEnvironmentRouter({
      prod: prod.inpsEnvironment,
      test: test.inpsEnvironment,
      testUsers: TEST_USERS,
    }).getInstance();

    await inject(fiscalCode, () =>
      client.checkDomanda({ codiceFiscale: fiscalCode ?? null }),
    );

    const [served] = [prod, test].filter(
      ({ signedFetch }) => signedFetch.mock.calls.length > 0,
    );
    const [url, init] = served?.signedFetch.mock.calls[0] as unknown as [
      string,
      { headers: Record<string, string> },
    ];
    return {
      calledEnvironments: [prod, test].filter(
        ({ signedFetch }) => signedFetch.mock.calls.length > 0,
      ).length,
      headers: init.headers,
      url,
    };
  };

  it("routes a listed test user to the test INPS environment", async () => {
    const call = await callCheckDomanda(TEST_FISCAL_CODE);

    expect(call.calledEnvironments).toBe(1);
    expect(call.url).toBe("https://test.inps.test/Domanda/CheckDomanda");
    expect(call.headers["inps-identity-codiceufficio"]).toBe("ufficio-test");
    expect(call.headers["inps-identity-userid"]).toBe(TEST_FISCAL_CODE);
  });

  it("routes an unlisted citizen to the prod INPS environment", async () => {
    const call = await callCheckDomanda("GLLGLL80A01H501V");

    expect(call.calledEnvironments).toBe(1);
    expect(call.url).toBe("https://prod.inps.test/Domanda/CheckDomanda");
    expect(call.headers["inps-identity-codiceufficio"]).toBe("ufficio-prod");
    expect(call.headers["inps-identity-userid"]).toBe("GLLGLL80A01H501V");
  });

  it("sends no identity headers when the request has no session", async () => {
    const call = await callCheckDomanda(undefined);

    expect(call.url).toBe("https://prod.inps.test/Domanda/CheckDomanda");
    expect(call.headers["inps-identity-userid"]).toBeUndefined();
  });
});
