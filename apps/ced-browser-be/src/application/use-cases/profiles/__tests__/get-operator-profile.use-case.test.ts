import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeGetOperatorProfileUseCase } from "../get-operator-profile.use-case.js";
import {
  createMockProfileRepository,
  MOCK_PROFILE_ID,
  mockOperatorProfileDetail,
} from "./mocks.js";

describe("makeGetOperatorProfileUseCase", () => {
  it("should return the operator profile detail when found", async () => {
    const profileRepository = createMockProfileRepository({
      getById: vi.fn().mockResolvedValue(ok(mockOperatorProfileDetail)),
    });
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      language: "it",
      profileId: MOCK_PROFILE_ID,
    });

    expect(result).toEqual(ok(mockOperatorProfileDetail));
    expect(profileRepository.getById).toHaveBeenCalledWith({
      language: "it",
      profileId: MOCK_PROFILE_ID,
    });
  });

  it("should default language to italian", async () => {
    const profileRepository = createMockProfileRepository({
      getById: vi.fn().mockResolvedValue(ok(mockOperatorProfileDetail)),
    });
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    await useCase({ profileId: MOCK_PROFILE_ID });

    expect(profileRepository.getById).toHaveBeenCalledWith({
      language: "it",
      profileId: MOCK_PROFILE_ID,
    });
  });

  it("should propagate repository errors", async () => {
    const repositoryError = new GenericError("DB connection failed");
    const profileRepository = createMockProfileRepository({
      getById: vi.fn().mockResolvedValue(err(repositoryError)),
    });
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      language: "it",
      profileId: MOCK_PROFILE_ID,
    });

    expect(result).toEqual(err(repositoryError));
  });

  it("should return NotFoundError when the profile is not visible", async () => {
    const profileRepository = createMockProfileRepository({
      getById: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      language: "it",
      profileId: MOCK_PROFILE_ID,
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
  });

  it("should return ValidationError when profileId is empty", async () => {
    const profileRepository = createMockProfileRepository();
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      language: "it",
      profileId: "",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileRepository.getById).not.toHaveBeenCalled();
  });
});
