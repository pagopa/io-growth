import { hashFiscalCode } from "@pagopa/io-core-domain/utilities";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { AppConfig } from "../config.js";

import { createSessionContextPreHandler } from "../async-local-storage-session-context.js";
import { createDbRouter } from "../routed-clients.js";

vi.mock("@pagopa/io-core-adapter-drizzle", () => ({
  createTypedDbClient: (config: { database: string }) => ({
    database: config.database,
  }),
}));

vi.mock("@pagopa/io-core-adapter-tracing", () => ({
  emitCustomEvent: () => () => undefined,
}));

const TEST_FISCAL_CODE = "RSSMRA80A01H501U";

const config = {
  POSTGRES_DB: "prod_db",
  POSTGRES_DB_TEST: "test_db",
  POSTGRES_HOST: "localhost",
  POSTGRES_PORT: 5432,
  POSTGRES_SSL: false,
  POSTGRES_USER: "user",
} as AppConfig;

const databaseFor = async (
  fiscalCode: string | undefined,
  appConfig: AppConfig = config,
): Promise<string> => {
  const router = createDbRouter(appConfig, [hashFiscalCode(TEST_FISCAL_CODE)]);
  const db = router.getInstance() as unknown as { database: string };

  const app = Fastify();
  if (fiscalCode !== undefined) {
    app.addHook(
      "preHandler",
      createSessionContextPreHandler(() =>
        Promise.resolve(
          ok({ familyName: "Rossi", fiscalCode, givenName: "Mario" }),
        ),
      ),
    );
  }
  app.get("/", () => ({ database: db.database }));

  const response = await app.inject({ method: "GET", url: "/" });
  return (response.json() as { database: string }).database;
};

describe("createDbRouter", () => {
  it("routes a listed test user to the test database", async () => {
    await expect(databaseFor(TEST_FISCAL_CODE)).resolves.toBe("test_db");
  });

  it("matches the fiscal code case-insensitively", async () => {
    await expect(databaseFor(TEST_FISCAL_CODE.toLowerCase())).resolves.toBe(
      "test_db",
    );
  });

  it("routes an unlisted citizen to the prod database", async () => {
    await expect(databaseFor("GLLGLL80A01H501V")).resolves.toBe("prod_db");
  });

  it("routes requests without a session to the prod database", async () => {
    await expect(databaseFor(undefined)).resolves.toBe("prod_db");
  });

  it("falls back to the prod database when POSTGRES_DB_TEST is unset", async () => {
    const withoutTestDb = { ...config, POSTGRES_DB_TEST: undefined };
    await expect(databaseFor(TEST_FISCAL_CODE, withoutTestDb)).resolves.toBe(
      "prod_db",
    );
  });

  it("exposes both instances for lifecycle management", () => {
    expect(createDbRouter(config, []).instances).toHaveLength(2);
  });

  it("keeps routing correctly across awaits, timers and parallel branches", async () => {
    const router = createDbRouter(config, [hashFiscalCode(TEST_FISCAL_CODE)]);
    const db = router.getInstance() as unknown as { database: string };

    const app = Fastify();
    app.addHook(
      "preHandler",
      createSessionContextPreHandler((req) =>
        Promise.resolve(
          ok({
            familyName: "Rossi",
            fiscalCode: String(req.headers["x-fc"]),
            givenName: "Mario",
          }),
        ),
      ),
    );
    app.get("/", async () => {
      await new Promise((resolve) => setTimeout(resolve, 5));
      const branches = await Promise.all([
        Promise.resolve().then(() => db.database),
        new Promise<string>((resolve) =>
          setImmediate(() => {
            resolve(db.database);
          }),
        ),
      ]);
      return { databases: [...branches, db.database] };
    });

    const [testResponse, prodResponse] = await Promise.all([
      app.inject({
        headers: { "x-fc": TEST_FISCAL_CODE },
        method: "GET",
        url: "/",
      }),
      app.inject({
        headers: { "x-fc": "GLLGLL80A01H501V" },
        method: "GET",
        url: "/",
      }),
    ]);

    expect(testResponse.json()).toEqual({
      databases: ["test_db", "test_db", "test_db"],
    });
    expect(prodResponse.json()).toEqual({
      databases: ["prod_db", "prod_db", "prod_db"],
    });
  });
});
