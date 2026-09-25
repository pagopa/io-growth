import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeOperatorDeletePlaceUseCase } from "../operator-delete-place.use-case.js";
import {
  createMockMaterializedViewRepository,
  createMockOpportunityRepository,
  createMockPlaceRepository,
  MOCK_OPERATOR_ID,
  MOCK_PLACE_ID,
  mockPlace,
} from "./mocks.js";

const validInput = {
  operatorId: MOCK_OPERATOR_ID,
  placeId: MOCK_PLACE_ID,
};

const makeDeps = (overrides?: {
  getByIdFails?: boolean;
  isSolePlace?: boolean;
  placeFound?: boolean;
  refreshFails?: boolean;
}) => {
  const placeRepository = createMockPlaceRepository({
    deleteByIdAndOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    getById: vi
      .fn()
      .mockResolvedValue(
        overrides?.getByIdFails
          ? err(new GenericError("db down"))
          : ok(overrides?.placeFound === false ? undefined : mockPlace),
      ),
  });
  const materializedViewRepository = createMockMaterializedViewRepository({
    refreshAll: vi
      .fn()
      .mockResolvedValue(
        overrides?.refreshFails ? err(new GenericError("boom")) : ok(undefined),
      ),
  });
  const opportunityRepository = createMockOpportunityRepository({
    existsWithSolePlaceByPlaceIdAndStatuses: vi
      .fn()
      .mockResolvedValue(ok(overrides?.isSolePlace ?? false)),
  });
  return { materializedViewRepository, opportunityRepository, placeRepository };
};

const makeUseCase = (deps: ReturnType<typeof makeDeps>) =>
  makeOperatorDeletePlaceUseCase(
    deps.placeRepository,
    deps.materializedViewRepository,
    deps.opportunityRepository,
  );

describe("makeOperatorDeletePlaceUseCase", () => {
  it("should delete the place and refresh the materialized views", async () => {
    const deps = makeDeps();

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.placeRepository.deleteByIdAndOperatorId).toHaveBeenCalledWith(
      validInput,
    );
    expect(deps.materializedViewRepository.refreshAll).toHaveBeenCalledWith();
  });

  it("should ask for the blocking statuses decided by the acceptance criteria", async () => {
    const deps = makeDeps();

    await makeUseCase(deps)(validInput);

    expect(
      deps.opportunityRepository.existsWithSolePlaceByPlaceIdAndStatuses,
    ).toHaveBeenCalledWith({
      placeId: MOCK_PLACE_ID,
      statuses: ["published", "suspended", "test_passed", "test_pending"],
    });
  });

  it("should return PreconditionFailedError when the place is the sole one of a blocking opportunity", async () => {
    const deps = makeDeps({ isSolePlace: true });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "PreconditionFailedError" })),
    );
    expect(deps.placeRepository.deleteByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should return NotFoundError when the place does not exist, belongs to another operator, or is the profile place", async () => {
    const deps = makeDeps({ placeFound: false });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(
      deps.opportunityRepository.existsWithSolePlaceByPlaceIdAndStatuses,
    ).not.toHaveBeenCalled();
    expect(deps.placeRepository.deleteByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should succeed even when refreshing the materialized views fails", async () => {
    const deps = makeDeps({ refreshFails: true });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(ok(undefined));
    expect(deps.placeRepository.deleteByIdAndOperatorId).toHaveBeenCalledWith(
      validInput,
    );
  });

  it("should return GenericError when reading the place fails", async () => {
    const deps = makeDeps({ getByIdFails: true });

    const result = await makeUseCase(deps)(validInput);

    expect(result).toEqual(err(expect.any(GenericError)));
    expect(deps.placeRepository.deleteByIdAndOperatorId).not.toHaveBeenCalled();
  });

  it("should return ValidationError when the placeId is not a ULID", async () => {
    const deps = makeDeps();

    const result = await makeUseCase(deps)({
      ...validInput,
      placeId: "not-a-ulid",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(deps.placeRepository.getById).not.toHaveBeenCalled();
  });
});
