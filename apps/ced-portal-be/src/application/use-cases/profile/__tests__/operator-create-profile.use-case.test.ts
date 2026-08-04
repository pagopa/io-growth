import { ConflictError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeOperatorCreateProfileUseCase } from "../operator-create-profile.use-case.js";
import {
  createMockProfileRepository,
  MOCK_OPERATOR_ID,
  mockCreateProfileInput,
  mockProfile,
} from "./mocks.js";

describe("makeOperatorCreateProfileUseCase", () => {
  it("should create operator profile when no profile exists", async () => {
    const profileRepository = createMockProfileRepository({
      create: vi.fn().mockImplementation(async (profile) => ok(profile)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(
      ok(
        expect.objectContaining({
          displayName: mockCreateProfileInput.displayName,
          operatorId: mockCreateProfileInput.operatorId,
          place: expect.objectContaining({
            id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
            name: mockCreateProfileInput.place.name,
            type: mockCreateProfileInput.place.type,
          }),
        }),
      ),
    );
    expect(profileRepository.getByOperatorId).toHaveBeenCalledWith(
      MOCK_OPERATOR_ID,
    );
    expect(profileRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        displayName: mockCreateProfileInput.displayName,
        operatorId: mockCreateProfileInput.operatorId,
        place: expect.objectContaining({
          id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
          name: mockCreateProfileInput.place.name,
          type: mockCreateProfileInput.place.type,
        }),
      }),
    );
  });

  it("should return ConflictError when profile already exists", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
    });
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(
      err(
        expect.objectContaining({
          kind: "ConflictError",
          message: "Conflict: Operator profile already exists",
        }),
      ),
    );
    expect(profileRepository.create).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from getByOperatorId", async () => {
    const repoError = new Error("DB connection failed");
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    });
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(err(repoError));
  });

  it("should propagate repository errors from create", async () => {
    const repoError = new Error("DB write failed");
    const profileRepository = createMockProfileRepository({
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(err(repoError));
  });

  it("should propagate ConflictError from create when a concurrent profile is created", async () => {
    const repoError = new ConflictError("Operator profile already exists");
    const profileRepository = createMockProfileRepository({
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const profileRepository = createMockProfileRepository();
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase({ ...mockCreateProfileInput, operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileRepository.getByOperatorId).not.toHaveBeenCalled();
  });

  it("should return ValidationError when displayName is empty", async () => {
    const profileRepository = createMockProfileRepository();
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase({
      ...mockCreateProfileInput,
      displayName: "",
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });

  it("should return ValidationError when place has invalid type", async () => {
    const profileRepository = createMockProfileRepository();
    const useCase = makeOperatorCreateProfileUseCase(profileRepository);

    const result = await useCase({
      ...mockCreateProfileInput,
      place: { ...mockCreateProfileInput.place, type: "invalid" as "online" },
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });
});
