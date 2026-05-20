import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeGetOperatorProfileUseCase } from "../get-operator-profile.use-case.js";
import {
  createMockProfileRepository,
  MOCK_OPERATOR_ID,
  mockProfile,
} from "./mocks.js";

describe("makeGetOperatorProfileUseCase", () => {
  it("should return operator profile when profile exists", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
    });
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
    });

    expect(result).toEqual(ok(mockProfile));
    expect(profileRepository.getByOperatorId).toHaveBeenCalledWith(
      MOCK_OPERATOR_ID,
    );
  });

  it("should return NotFoundError when profile does not exist", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
    });

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "NotFoundError",
          message: "Unable to find Profile: not found",
        }),
      ),
    );
  });

  it("should propagate repository errors", async () => {
    const repoError = new Error("DB connection failed");
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      operatorId: MOCK_OPERATOR_ID,
    });

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const profileRepository = createMockProfileRepository();
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({ operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileRepository.getByOperatorId).not.toHaveBeenCalled();
  });
});
