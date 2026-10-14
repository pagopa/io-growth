import type { Query } from "drizzle-orm";

import { drizzle } from "drizzle-orm/postgres-js";
import { ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { PlaceSearchItem } from "../../../../domain/ports/outbound/persistence/place.repository.js";

import { createDrizzlePlaceRepository } from "../drizzle-place.repository.js";
import * as schema from "../schema/index.js";

const PROFILE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CA";
const OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CB";

const setup = () => {
  const db = Object.assign(drizzle.mock({ schema }), {
    closeConnection: vi.fn<() => Promise<void>>(),
  });
  const execute = vi.fn<(query: Query) => Promise<unknown>>();
  const prepareQuery = db._.session.prepareQuery.bind(db._.session);
  vi.spyOn(db._.session, "prepareQuery").mockImplementation((...args) => {
    const prepared = prepareQuery(...args);
    vi.spyOn(prepared, "execute").mockImplementation(() =>
      execute(prepared.getQuery()),
    );
    return prepared;
  });

  return { execute, repository: createDrizzlePlaceRepository(db) };
};

describe("createDrizzlePlaceRepository.findAllByFullText", () => {
  it("uses the profile id as entityId for profile results", async () => {
    const { execute, repository } = setup();
    const profileResult: PlaceSearchItem = {
      address: null,
      entityId: PROFILE_ID,
      id: "01JVMK3N8XQZP5T6G2WYHAB4CC",
      name: "Comune di Alessandria",
      operatorFiscalCode: "00000000000",
      operatorName: "Operator Test Name",
      type: "profile",
    };
    execute.mockResolvedValueOnce([profileResult]);

    await expect(
      repository.findAllByFullText({ query: "comune" }),
    ).resolves.toEqual(ok([profileResult]));
    expect(execute.mock.calls[0][0].sql).toContain(
      'COALESCE("profile_id", "operator_id")',
    );
  });

  it("keeps the operator id as entityId for place results", async () => {
    const { execute, repository } = setup();
    const placeResult: PlaceSearchItem = {
      address: null,
      entityId: OPERATOR_ID,
      id: "01JVMK3N8XQZP5T6G2WYHAB4CD",
      name: "Sportello centrale",
      operatorFiscalCode: "00000000001",
      operatorName: "Operator Test Name 2",
      type: "place",
    };
    execute.mockResolvedValueOnce([placeResult]);

    await expect(
      repository.findAllByFullText({ query: "sportello" }),
    ).resolves.toEqual(ok([placeResult]));
    expect(execute.mock.calls[0][0].sql).toContain(
      'COALESCE("profile_id", "operator_id")',
    );
  });
});
