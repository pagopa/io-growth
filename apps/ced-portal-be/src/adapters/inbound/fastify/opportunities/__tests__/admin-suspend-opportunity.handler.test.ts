import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
} from "@pagopa/io-core-adapter-fastify";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { AdminSuspendOpportunityUseCase } from "../../../../../application/use-cases/opportunities/admin-suspend-opportunity.use-case.js";
import type { Session } from "../../../../../domain/entities/session.js";

import { createSessionContextPreHandler } from "../../../../../async-local-storage-session-context.js";
import { SessionSchema } from "../../auth/session.js";
import { mountAdminSuspendOpportunityHandler } from "../admin-suspend-opportunity.handler.js";

const baseSession = {
  firstName: "Mario",
  lastName: "Rossi",
  operatorExternalId: "",
  operatorName: "",
  referentExternalId: "",
  role: "security",
};

const buildApp = (session: Session) => {
  const app = Fastify();
  const resolver = vi.fn().mockResolvedValue(ok(session));

  app.addHook("preHandler", createAuthenticationPreHandler(resolver));
  app.addHook(
    "preHandler",
    createSessionContextPreHandler((request) =>
      getSessionFromRequest(request, SessionSchema),
    ),
  );

  return app;
};

const OPPORTUNITY_ID = "01ARZ3NDEKTSV4RRFFQ69G5FAV";

describe("mountAdminSuspendOpportunityHandler", () => {
  it("returns 204 when the session is admin", async () => {
    const useCase: AdminSuspendOpportunityUseCase = vi
      .fn()
      .mockResolvedValue(ok(undefined));
    const app = buildApp({ ...baseSession, userType: "admin" });
    mountAdminSuspendOpportunityHandler(app, useCase);

    const response = await app.inject({
      headers: { authorization: "Bearer test-token" },
      method: "PATCH",
      payload: {
        suspendFrom: "2026-08-01",
        suspensionMessage: "Manutenzione programmata",
      },
      url: `/api/opportunities/${OPPORTUNITY_ID}/suspension/schedule`,
    });

    expect(response.statusCode).toBe(204);
    expect(useCase).toHaveBeenCalledWith({
      opportunityId: OPPORTUNITY_ID,
      suspendFrom: "2026-08-01",
      suspensionMessage: "Manutenzione programmata",
    });
  });

  it("returns 403 when the session is operator, without calling the use case", async () => {
    const useCase: AdminSuspendOpportunityUseCase = vi.fn();
    const app = buildApp({
      ...baseSession,
      operatorId: "op-1",
      userType: "operator",
    });
    mountAdminSuspendOpportunityHandler(app, useCase);

    const response = await app.inject({
      headers: { authorization: "Bearer test-token" },
      method: "PATCH",
      payload: {
        suspendFrom: "2026-08-01",
        suspensionMessage: "Manutenzione programmata",
      },
      url: `/api/opportunities/${OPPORTUNITY_ID}/suspension/schedule`,
    });

    expect(response.statusCode).toBe(403);
    expect(useCase).not.toHaveBeenCalled();
  });
});
