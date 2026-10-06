import type { Query } from "drizzle-orm";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { drizzle } from "drizzle-orm/postgres-js";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { ListPlacesInput } from "../../../../domain/ports/outbound/persistence/place.repository.js";
import type { PlaceRow } from "../place-row.mapper.js";

import { createDrizzlePlaceRepository } from "../drizzle-place.repository.js";
import * as schema from "../schema/index.js";

const OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
const ONLINE_PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CE";
const OFFLINE_PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CF";
const input: ListPlacesInput = {
  limit: 20,
  offset: 0,
  operatorId: OPERATOR_ID,
};
const onlineRow: PlaceRow = {
  address: null,
  id: ONLINE_PLACE_ID,
  name: "Sportello remoto",
  supportContacts: [
    { id: "01JVMK3N8XQZP5T6G2WYHAB4CG", type: "email", value: "a@example.org" },
    { id: "01JVMK3N8XQZP5T6G2WYHAB4CH", type: "phone", value: "+39 123" },
  ],
  type: "online",
  website: { url: "https://example.org" },
};
const offlineRow: PlaceRow = {
  address: {
    city: "Roma",
    country: "IT",
    postalCode: "00100",
    state: "RM",
    street: "Via Roma 1",
  },
  id: OFFLINE_PLACE_ID,
  name: "Sportello centrale",
  supportContacts: [],
  type: "offline",
  website: null,
};

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

describe("createDrizzlePlaceRepository.listByOperatorId", () => {
  it("returns online/offline places with batched opportunity counts", async () => {
    const { execute, repository } = setup();
    execute
      .mockResolvedValueOnce([onlineRow, offlineRow])
      .mockResolvedValueOnce([{ total: 7 }])
      .mockResolvedValueOnce([
        { associatedOpportunities: 2, placeId: ONLINE_PLACE_ID },
        { associatedOpportunities: 1, placeId: OFFLINE_PLACE_ID },
      ]);

    await expect(repository.listByOperatorId(input)).resolves.toEqual(
      ok({
        items: [
          {
            associatedOpportunities: 2,
            id: onlineRow.id,
            name: onlineRow.name,
            supportContacts: onlineRow.supportContacts,
            type: "online",
            website: onlineRow.website,
          },
          {
            address: offlineRow.address,
            associatedOpportunities: 1,
            id: offlineRow.id,
            name: offlineRow.name,
            supportContacts: [],
            type: "offline",
          },
        ],
        total: 7,
      }),
    );
    expect(execute).toHaveBeenCalledTimes(3);
    const associationQuery = execute.mock.calls[2][0];
    expect(associationQuery.sql).toContain('from "opportunity_place"');
    expect(associationQuery.sql).toContain('inner join "opportunity"');
    expect(associationQuery.sql).toContain(
      '"opportunity"."id" = "opportunity_place"."opportunity_id"',
    );
    expect(associationQuery.sql).toContain(
      'group by "opportunity_place"."place_id"',
    );
    expect(associationQuery.sql).toContain('"opportunity"."status" <>');
    expect(associationQuery.params).toEqual([
      ONLINE_PLACE_ID,
      OFFLINE_PLACE_ID,
      OPERATOR_ID,
      "deleted",
    ]);
    expect(associationQuery.sql).not.toContain("support_contact");
    expect(associationQuery.sql).not.toContain("date_from");
  });

  it("excludes profile places and other operators before pagination and counting", async () => {
    const { execute, repository } = setup();
    execute.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 7 }]);

    await expect(
      repository.listByOperatorId({ ...input, limit: 7, offset: 5 }),
    ).resolves.toEqual(ok({ items: [], total: 7 }));

    const [pageQuery, countQuery] = execute.mock.calls.map(([query]) => query);
    for (const query of [pageQuery, countQuery]) {
      expect(query.sql).toContain('"place"."operator_id" =');
      expect(query.sql).toContain("not exists");
      expect(query.sql).toContain('from "profile"');
      expect(query.sql).toContain('"profile"."place_id" = "place"."id"');
      expect(query.params).toContain(OPERATOR_ID);
    }
    expect(pageQuery.sql).toContain(
      'order by "place"."created_at" asc, "place"."id" asc',
    );
    expect(pageQuery.sql).toContain("limit");
    expect(pageQuery.sql).toContain("offset");
    expect(pageQuery.params.slice(-2)).toEqual([7, 5]);
    expect(countQuery.sql).not.toContain("limit");
    expect(countQuery.sql).not.toContain("offset");
    expect(countQuery.sql).not.toContain("opportunity_place");
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it.each(["online", "offline"] as const)(
    "combines literal case-insensitive search with the %s filter on page and total",
    async (type) => {
      const { execute, repository } = setup();
      execute.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);

      await expect(
        repository.listByOperatorId({
          ...input,
          search: "50%_\\off",
          type,
        }),
      ).resolves.toEqual(ok({ items: [], total: 0 }));

      for (const [query] of execute.mock.calls) {
        expect(query.sql).toContain('"place"."name" ilike');
        expect(query.sql).toContain('"place"."type" =');
        expect(query.sql).toContain(" and ");
        expect(
          query.params.filter((param) => typeof param === "string"),
        ).toEqual([OPERATOR_ID, "%50\\%\\_\\\\off%", type]);
        expect(query.sql).not.toContain("50%");
      }
    },
  );

  it.each([undefined, ""])(
    "does not restrict search or type when search is %j",
    async (search) => {
      const { execute, repository } = setup();
      execute.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);

      await repository.listByOperatorId({ ...input, search });

      for (const [query] of execute.mock.calls) {
        expect(query.sql).not.toContain("ilike");
        expect(query.sql).not.toContain('"place"."type" =');
      }
    },
  );

  it("returns zero associations when no qualifying opportunities are linked", async () => {
    const { execute, repository } = setup();
    execute
      .mockResolvedValueOnce([onlineRow])
      .mockResolvedValueOnce([{ total: 1 }])
      .mockResolvedValueOnce([]);

    await expect(repository.listByOperatorId(input)).resolves.toEqual(
      ok({
        items: [
          expect.objectContaining({
            associatedOpportunities: 0,
            id: ONLINE_PLACE_ID,
          }),
        ],
        total: 1,
      }),
    );
  });

  it.each([0, 10])(
    "skips association queries for empty pages, retaining total %i",
    async (total) => {
      const { execute, repository } = setup();
      execute.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total }]);

      await expect(
        repository.listByOperatorId({ ...input, offset: 100 }),
      ).resolves.toEqual(ok({ items: [], total }));
      expect(execute).toHaveBeenCalledTimes(2);
    },
  );
});

describe("createDrizzlePlaceRepository.listByOperatorId errors", () => {
  it("propagates place-mapping errors without querying association counts", async () => {
    const { execute, repository } = setup();
    execute
      .mockResolvedValueOnce([{ ...offlineRow, address: null }])
      .mockResolvedValueOnce([{ total: 1 }]);

    await expect(repository.listByOperatorId(input)).resolves.toEqual(
      err(
        new GenericError(
          `Data integrity error: offline place ${OFFLINE_PLACE_ID} is missing its address`,
        ),
      ),
    );
    expect(execute).toHaveBeenCalledTimes(2);
  });

  it.each(["page", "total", "associations"] as const)(
    "propagates %s query failures rather than returning partial data",
    async (failure) => {
      const { execute, repository } = setup();
      if (failure === "page") {
        execute.mockRejectedValueOnce(new Error("DB unavailable"));
      } else {
        execute.mockResolvedValueOnce([onlineRow]);
      }
      if (failure === "total") {
        execute.mockRejectedValueOnce(new Error("DB unavailable"));
      } else {
        execute.mockResolvedValueOnce([{ total: 1 }]);
      }
      if (failure === "associations") {
        execute.mockRejectedValueOnce(new Error("DB unavailable"));
      }

      await expect(repository.listByOperatorId(input)).resolves.toEqual(
        err(
          new GenericError(
            "Failed to list operator places: Error: DB unavailable",
          ),
        ),
      );
    },
  );
});
