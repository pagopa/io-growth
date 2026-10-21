import { createAuthenticationPreHandler } from "@pagopa/io-core-adapter-fastify";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { GetOperatorProfileUseCase } from "../../../../../application/use-cases/profiles/get-operator-profile.use-case.js";

import {
  MOCK_PROFILE_ID,
  mockOperatorProfileDetail,
} from "../../../../../application/use-cases/profiles/__tests__/mocks.js";
import { mountGetOperatorProfileHandler } from "../get-operator-profile.handler.js";

describe("mountGetOperatorProfileHandler", () => {
  it("returns the operator ID, privacy and terms URLs", async () => {
    const app = Fastify();
    const useCase: GetOperatorProfileUseCase = vi
      .fn()
      .mockResolvedValue(ok(mockOperatorProfileDetail));
    app.addHook(
      "preHandler",
      createAuthenticationPreHandler(
        vi.fn().mockResolvedValue(
          ok({
            familyName: "Bianchi",
            fiscalCode: "BNCLCU00A01H501X",
            givenName: "Luca",
          }),
        ),
      ),
    );
    mountGetOperatorProfileHandler(app, useCase);

    const response = await app.inject({
      headers: { authorization: "Bearer test-token" },
      method: "GET",
      url: `/api/profiles/${MOCK_PROFILE_ID}`,
    });

    expect(response.statusCode).toBe(200);
    expect(useCase).toHaveBeenCalledWith({
      language: undefined,
      profileId: MOCK_PROFILE_ID,
    });
    expect(response.json()).toMatchObject({
      operatorId: mockOperatorProfileDetail.operatorId,
      privacyUrl: mockOperatorProfileDetail.privacyUrl,
      tosUrl: mockOperatorProfileDetail.tosUrl,
    });
    expect(response.json().operatorId).not.toBe(MOCK_PROFILE_ID);
    expect(response.json()).not.toHaveProperty("termsUrl");
    await app.close();
  });
});
