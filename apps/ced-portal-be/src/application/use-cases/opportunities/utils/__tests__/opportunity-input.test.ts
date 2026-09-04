import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { OperatorRepository } from "../../../../../domain/ports/outbound/persistence/operator.repository.js";
import type { OpportunityCategoryRepository } from "../../../../../domain/ports/outbound/persistence/opportunity-category.repository.js";
import type { PlaceRepository } from "../../../../../domain/ports/outbound/persistence/place.repository.js";

import {
  LocalizedMetadataListInputSchema,
  PlaceIdsInputSchema,
  validateExistence,
} from "../opportunity-input.js";

const OPERATOR_ID = "01JVMK3N8XQZP5T6G2WYHAB4CD";
const CATEGORY_ID = "01KRJXEYD44B58700GT982CCYY";
const PLACE_ID = "01JVMK3N8XQZP5T6G2WYHAB4CE";

const operatorRepo = (o?: Partial<OperatorRepository>): OperatorRepository => ({
  create: vi.fn(),
  getByExternalId: vi.fn(),
  getById: vi
    .fn()
    .mockResolvedValue(
      ok({ externalId: "ext", id: OPERATOR_ID, name: "Op", status: "active" }),
    ),
  ...o,
});

const categoryRepo = (
  o?: Partial<OpportunityCategoryRepository>,
): OpportunityCategoryRepository => ({
  getById: vi
    .fn()
    .mockResolvedValue(ok({ description: "d", id: CATEGORY_ID, title: "t" })),
  list: vi.fn(),
  ...o,
});

const placeRepo = (o?: Partial<PlaceRepository>): PlaceRepository => ({
  create: vi.fn(),
  getById: vi.fn(),
  getIdsByOperator: vi.fn().mockResolvedValue(ok([PLACE_ID])),
  listByOperatorId: vi.fn(),
  ...o,
});

const baseExistenceInput = (overrides?: {
  categoryId?: string;
  operatorRepository?: OperatorRepository;
  opportunityCategoryRepository?: OpportunityCategoryRepository;
  placeIds?: readonly string[];
  placeRepository?: PlaceRepository;
}) => ({
  categoryId: overrides?.categoryId ?? CATEGORY_ID,
  operatorId: OPERATOR_ID,
  operatorRepository: overrides?.operatorRepository ?? operatorRepo(),
  opportunityCategoryRepository:
    overrides?.opportunityCategoryRepository ?? categoryRepo(),
  placeIds: overrides?.placeIds ?? [PLACE_ID],
  placeRepository: overrides?.placeRepository ?? placeRepo(),
});

describe("validateExistence", () => {
  it("resolves ok when operator, category and places all exist", async () => {
    const placeRepository = placeRepo();
    const result = await validateExistence(
      baseExistenceInput({ placeRepository }),
    );

    expect(result).toEqual(ok(undefined));
    expect(placeRepository.getIdsByOperator).toHaveBeenCalledOnce();
  });

  it("returns ValidationError when the operator does not exist", async () => {
    const result = await validateExistence(
      baseExistenceInput({
        operatorRepository: operatorRepo({
          getById: vi.fn().mockResolvedValue(ok(undefined)),
        }),
      }),
    );

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "ValidationError",
          message: expect.stringContaining("Operator"),
        }),
      ),
    );
  });

  it("returns ValidationError when the category does not exist", async () => {
    const result = await validateExistence(
      baseExistenceInput({
        opportunityCategoryRepository: categoryRepo({
          getById: vi.fn().mockResolvedValue(ok(undefined)),
        }),
      }),
    );

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "ValidationError",
          message: expect.stringContaining("category"),
        }),
      ),
    );
  });

  it("returns ValidationError when a place is missing or not owned", async () => {
    const result = await validateExistence(
      baseExistenceInput({
        // returns none of the requested placeIds
        placeRepository: placeRepo({
          getIdsByOperator: vi.fn().mockResolvedValue(ok([])),
        }),
      }),
    );

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "ValidationError",
          message: expect.stringContaining(PLACE_ID),
        }),
      ),
    );
  });

  it("skips the place lookup when placeIds is empty", async () => {
    const placeRepository = placeRepo();
    const result = await validateExistence(
      baseExistenceInput({ placeIds: [], placeRepository }),
    );

    expect(result).toEqual(ok(undefined));
    expect(placeRepository.getIdsByOperator).not.toHaveBeenCalled();
  });

  it("propagates a repository error", async () => {
    const repoError = new GenericError("DB down");
    const result = await validateExistence(
      baseExistenceInput({
        opportunityCategoryRepository: categoryRepo({
          getById: vi.fn().mockResolvedValue(err(repoError)),
        }),
      }),
    );

    expect(result).toEqual(err(repoError));
  });
});

describe("LocalizedMetadataListInputSchema", () => {
  const italianName = { key: "name", language: "it", value: "Nome" };

  it("accepts a list containing an Italian name entry", () => {
    expect(
      LocalizedMetadataListInputSchema.safeParse([italianName]).success,
    ).toBe(true);
  });

  it("rejects a list without an Italian name entry (refine)", () => {
    const parsed = LocalizedMetadataListInputSchema.safeParse([
      { key: "name", language: "en", value: "Name" },
      { key: "description", language: "it", value: "Descrizione" },
    ]);
    expect(parsed.success).toBe(false);
  });

  it("rejects an empty list (min 1)", () => {
    expect(LocalizedMetadataListInputSchema.safeParse([]).success).toBe(false);
  });
});

describe("PlaceIdsInputSchema", () => {
  const A = "01JVMK3N8XQZP5T6G2WYHAB4CD";
  const B = "01JVMK3N8XQZP5T6G2WYHAB4CE";

  it("accepts a list of unique ids", () => {
    expect(PlaceIdsInputSchema.safeParse([A, B]).success).toBe(true);
  });

  it("accepts an empty list", () => {
    expect(PlaceIdsInputSchema.safeParse([]).success).toBe(true);
  });

  it("rejects a list with a duplicate id (refine)", () => {
    // opportunity_place has a composite PK on (opportunityId, placeId): a
    // duplicate would otherwise abort the transaction with a raw 500.
    expect(PlaceIdsInputSchema.safeParse([A, A]).success).toBe(false);
  });
});
