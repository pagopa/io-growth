import { describe, expect, it, vi } from "vitest";

import type { AppConfig } from "../config.js";
import type { Session } from "../domain/entities/session.js";
import type { UserType } from "../domain/entities/user-type.js";

import { createSessionContext } from "../async-local-storage-session-context.js";
import {
  createAdminContactsRouter,
  createArRouter,
  createDbRouter,
} from "../routed-clients.js";

vi.mock("@pagopa/io-core-adapter-drizzle", () => ({
  createTypedDbClient: (config: { database: string }) => ({
    database: config.database,
  }),
}));

vi.mock("@pagopa/io-core-adapter-ar", () => ({
  createArClient: (config: { baseUrl: string }) => ({
    baseUrl: config.baseUrl,
  }),
}));

vi.mock("@pagopa/io-core-adapter-tracing", () => ({
  emitCustomEvent: () => () => undefined,
}));

const config = {
  ADMIN_EMAIL_ADDRESS: "admin@prod.example",
  ADMIN_EMAIL_ADDRESS_TEST: "admin@test.example",
  AR_API_KEY: "prod-key",
  AR_API_KEY_TEST: "test-key",
  AR_ENDPOINT: "https://ar.prod.example",
  AR_ENDPOINT_TEST: "https://ar.test.example",
  POSTGRES_DB: "prod_db",
  POSTGRES_DB_TEST: "test_db",
  POSTGRES_HOST: "localhost",
  POSTGRES_MAX_CONNECTIONS: 10,
  POSTGRES_PORT: 5432,
  POSTGRES_SSL: false,
  POSTGRES_USER: "user",
} as AppConfig;

const sessionOf = (userType: UserType): Session => ({
  firstName: "Mario",
  lastName: "Rossi",
  operatorExternalId: "org-ext-1",
  operatorName: "Ente Demo",
  referentExternalId: "ref-1",
  role: "security",
  userType,
});

describe("createDbRouter", () => {
  const db = (appConfig: AppConfig = config) =>
    createDbRouter(appConfig).getInstance() as unknown as { database: string };

  it.each<UserType>(["test_admin", "test_operator"])(
    "routes %s to the test database",
    (userType) => {
      const result = createSessionContext(
        sessionOf(userType),
        () => db().database,
      );

      expect(result).toBe("test_db");
    },
  );

  it.each<UserType>(["admin", "operator"])(
    "routes %s to the prod database",
    (userType) => {
      const result = createSessionContext(
        sessionOf(userType),
        () => db().database,
      );

      expect(result).toBe("prod_db");
    },
  );

  it("routes requests without a session to the prod database", () => {
    expect(db().database).toBe("prod_db");
  });

  it("falls back to the prod database when POSTGRES_DB_TEST is unset", () => {
    const withoutTestDb = { ...config, POSTGRES_DB_TEST: undefined };

    const result = createSessionContext(
      sessionOf("test_operator"),
      () => db(withoutTestDb).database,
    );

    expect(result).toBe("prod_db");
  });

  it("exposes both instances for lifecycle management", () => {
    expect(createDbRouter(config).instances).toHaveLength(2);
  });
});

describe("createArRouter", () => {
  const ar = () =>
    createArRouter(config).getInstance() as unknown as { baseUrl: string };

  it("routes test users to the test AR endpoint", () => {
    const result = createSessionContext(
      sessionOf("test_operator"),
      () => ar().baseUrl,
    );

    expect(result).toBe("https://ar.test.example");
  });

  it("routes non-test users to the prod AR endpoint", () => {
    const result = createSessionContext(
      sessionOf("operator"),
      () => ar().baseUrl,
    );

    expect(result).toBe("https://ar.prod.example");
  });

  it("routes requests without a session to the prod AR endpoint", () => {
    expect(ar().baseUrl).toBe("https://ar.prod.example");
  });
});

describe("createAdminContactsRouter", () => {
  const adminEmail = () =>
    createAdminContactsRouter(config).getInstance().emailAddress;

  it.each<UserType>(["test_admin", "test_operator"])(
    "routes %s to the test admin address",
    (userType) => {
      expect(createSessionContext(sessionOf(userType), adminEmail)).toBe(
        "admin@test.example",
      );
    },
  );

  it.each<UserType>(["admin", "operator"])(
    "routes %s to the prod admin address",
    (userType) => {
      expect(createSessionContext(sessionOf(userType), adminEmail)).toBe(
        "admin@prod.example",
      );
    },
  );

  it("routes requests without a session to the prod admin address", () => {
    expect(adminEmail()).toBe("admin@prod.example");
  });
});
