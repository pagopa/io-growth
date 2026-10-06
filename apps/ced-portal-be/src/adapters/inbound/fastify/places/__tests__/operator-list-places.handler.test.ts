import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
} from "@pagopa/io-core-adapter-fastify";
import { GenericError } from "@pagopa/io-core-domain/errors";
import Fastify from "fastify";
import { err, ok } from "neverthrow";
import { describe, expect, it, onTestFinished, vi } from "vitest";

import type { OperatorListPlacesUseCase } from "../../../../../application/use-cases/places/operator-list-places.use-case.js";
import type { Session } from "../../../../../domain/entities/session.js";
import type { PaginatedPlaces } from "../../../../../domain/ports/outbound/persistence/place.repository.js";

import { createSessionContextPreHandler } from "../../../../../async-local-storage-session-context.js";
import { SessionSchema } from "../../auth/session.js";
import { mountOperatorListPlacesHandler } from "../operator-list-places.handler.js";

const OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
const operatorSession: Session = {
  firstName: "Luca",
  lastName: "Bianchi",
  operatorExternalId: "",
  operatorId: OPERATOR_ID,
  operatorName: "",
  referentExternalId: "",
  role: "security",
  userType: "operator",
};

const places: PaginatedPlaces = {
  items: [
    {
      associatedOpportunities: 2,
      id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
      name: "Sportello remoto",
      supportContacts: [],
      type: "online",
      website: { url: "https://example.org" },
    },
    {
      address: {
        city: "Roma",
        country: "IT",
        postalCode: "00100",
        state: "RM",
        street: "Via Roma 1",
      },
      associatedOpportunities: 0,
      id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
      name: "Sportello centrale",
      supportContacts: [],
      type: "offline",
    },
  ],
  total: 2,
};

const buildApp = (
  useCase: OperatorListPlacesUseCase,
  session: Session = operatorSession,
) => {
  const app = Fastify();
  app.addHook(
    "preHandler",
    createAuthenticationPreHandler(vi.fn().mockResolvedValue(ok(session))),
  );
  app.addHook(
    "preHandler",
    createSessionContextPreHandler((request) =>
      getSessionFromRequest(request, SessionSchema),
    ),
  );
  mountOperatorListPlacesHandler(app, useCase);
  onTestFinished(() => app.close());
  return app;
};

const authenticatedRequest = {
  headers: { authorization: "Bearer test-session" },
  method: "GET" as const,
};

describe("mountOperatorListPlacesHandler", () => {
  it.each(["operator", "test_operator"] as const)(
    "returns paginated places with opportunity counts for %s sessions",
    async (userType) => {
      const useCase = vi
        .fn<OperatorListPlacesUseCase>()
        .mockResolvedValue(ok(places));
      const app = buildApp(useCase, { ...operatorSession, userType });

      const response = await app.inject({
        ...authenticatedRequest,
        url: "/api/operator/places",
      });

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual(places);
      expect(useCase).toHaveBeenCalledWith({
        limit: 20,
        offset: 0,
        operatorId: OPERATOR_ID,
        search: undefined,
        type: undefined,
      });
    },
  );

  it.each(["online", "offline"] as const)(
    "coerces pagination and forwards search and %s type",
    async (type) => {
      const useCase = vi
        .fn<OperatorListPlacesUseCase>()
        .mockResolvedValue(ok({ items: [], total: 0 }));
      const app = buildApp(useCase);

      const response = await app.inject({
        ...authenticatedRequest,
        url: `/api/operator/places?offset=5&limit=100&search=Sportello%20Roma&type=${type}&operatorId=another-operator`,
      });

      expect(response.statusCode).toBe(200);
      expect(useCase).toHaveBeenCalledWith({
        limit: 100,
        offset: 5,
        operatorId: OPERATOR_ID,
        search: "Sportello Roma",
        type,
      });
    },
  );

  it.each([
    "limit=0",
    "limit=101",
    "limit=1.5",
    "limit=invalid",
    "limit=Infinity",
    "offset=-1",
    "offset=0.5",
    "offset=invalid",
    "type=invalid",
    "type=",
    "type=online&type=offline",
  ])(
    "rejects invalid query %s without invoking the use case",
    async (query) => {
      const useCase = vi.fn<OperatorListPlacesUseCase>();
      const app = buildApp(useCase);

      const response = await app.inject({
        ...authenticatedRequest,
        url: `/api/operator/places?${query}`,
      });

      expect(response.statusCode).toBe(400);
      expect(useCase).not.toHaveBeenCalled();
    },
  );

  it("preserves the total when the requested page is empty", async () => {
    const emptyPage = { items: [], total: 3 };
    const useCase = vi
      .fn<OperatorListPlacesUseCase>()
      .mockResolvedValue(ok(emptyPage));
    const app = buildApp(useCase);

    const response = await app.inject({
      ...authenticatedRequest,
      url: "/api/operator/places?offset=100",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual(emptyPage);
  });

  it("returns 401 without authentication", async () => {
    const useCase = vi.fn<OperatorListPlacesUseCase>();
    const app = buildApp(useCase);

    const response = await app.inject({
      method: "GET",
      url: "/api/operator/places",
    });

    expect(response.statusCode).toBe(401);
    expect(useCase).not.toHaveBeenCalled();
  });

  it.each(["admin", "test_admin"] as const)(
    "returns 403 for %s sessions",
    async (userType) => {
      const useCase = vi.fn<OperatorListPlacesUseCase>();
      const app = buildApp(useCase, { ...operatorSession, userType });

      const response = await app.inject({
        ...authenticatedRequest,
        url: "/api/operator/places",
      });

      expect(response.statusCode).toBe(403);
      expect(useCase).not.toHaveBeenCalled();
    },
  );

  it("returns 500 for repository failures", async () => {
    const useCase = vi
      .fn<OperatorListPlacesUseCase>()
      .mockResolvedValue(err(new GenericError("Database unavailable")));
    const app = buildApp(useCase);

    const response = await app.inject({
      ...authenticatedRequest,
      url: "/api/operator/places",
    });

    expect(response.statusCode).toBe(500);
  });
});
