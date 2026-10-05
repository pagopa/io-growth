import { createAuthenticationPreHandler } from "@pagopa/io-core-adapter-fastify";
import Fastify from "fastify";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PlaceDetail } from "../../../../../domain/ports/outbound/persistence/place.repository.js";

import { createMockPlaceRepository } from "../../../../../application/use-cases/places/__tests__/mocks.js";
import { makeGetPlaceDetailUseCase } from "../../../../../application/use-cases/places/get-place-detail.use-case.js";
import { mountGetPlaceDetailHandler } from "../get-place-detail.handler.js";

describe("mountGetPlaceDetailHandler", () => {
  it("returns the operator ID without changing the place and profile IDs", async () => {
    const detail: PlaceDetail = {
      address: null,
      contacts: { website: "https://example.com" },
      entityId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
      entityName: "Operator Profile",
      id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
      operatorFiscalCode: "00000000000",
      operatorId: "01JVMK3N8XQZP5T6G2WYHAB4CA",
      operatorName: "Operator Test Name",
      opportunities: [],
      relatedPlaces: [],
      title: "Online Place",
    };
    const repository = createMockPlaceRepository({
      findById: vi.fn().mockResolvedValue(ok(detail)),
    });
    const app = Fastify();
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
    mountGetPlaceDetailHandler(app, makeGetPlaceDetailUseCase(repository));

    const response = await app.inject({
      headers: { authorization: "Bearer token" },
      method: "GET",
      url: `/api/places/${detail.id}`,
    });

    expect(response.statusCode).toBe(200);
    expect(repository.findById).toHaveBeenCalledWith({
      language: "it",
      placeId: detail.id,
    });
    expect(response.json()).toEqual(detail);
    await app.close();
  });
});
