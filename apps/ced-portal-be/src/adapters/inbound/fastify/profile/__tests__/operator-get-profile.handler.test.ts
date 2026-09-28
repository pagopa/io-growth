import {
  createAuthenticationPreHandler,
  getSessionFromRequest,
} from "@pagopa/io-core-adapter-fastify";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OperatorGetProfileUseCase } from "../../../../../application/use-cases/profile/operator-get-profile.use-case.js";
import type { Session } from "../../../../../domain/entities/session.js";

import {
  MOCK_OPERATOR_ID,
  mockProfile,
} from "../../../../../application/use-cases/profile/__tests__/mocks.js";
import { createSessionContextPreHandler } from "../../../../../async-local-storage-session-context.js";
import { SessionSchema } from "../../auth/session.js";
import { mountOperatorGetProfileHandler } from "../operator-get-profile.handler.js";

const session: Session = {
  firstName: "Luca",
  lastName: "Bianchi",
  operatorExternalId: "",
  operatorId: MOCK_OPERATOR_ID,
  operatorName: "",
  referentExternalId: "",
  role: "security",
  userType: "operator",
};

describe("mountOperatorGetProfileHandler", () => {
  it("returns the persisted privacy and terms URLs", async () => {
    const app = Fastify();
    const useCase: OperatorGetProfileUseCase = vi
      .fn()
      .mockResolvedValue(ok(mockProfile));
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
    mountOperatorGetProfileHandler(app, useCase);

    const response = await app.inject({
      headers: { authorization: "Bearer test-token" },
      method: "GET",
      url: "/api/operator/profile",
    });

    expect(response.statusCode).toBe(200);
    expect(useCase).toHaveBeenCalledWith({ operatorId: MOCK_OPERATOR_ID });
    expect(response.json()).toMatchObject({
      privacyUrl: mockProfile.privacyUrl,
      tosUrl: mockProfile.tosUrl,
    });
    expect(response.json()).not.toHaveProperty("termsUrl");
  });
});
