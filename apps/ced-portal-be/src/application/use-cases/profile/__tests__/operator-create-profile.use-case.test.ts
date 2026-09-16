import { ConflictError, GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeOperatorCreateProfileUseCase } from "../operator-create-profile.use-case.js";
import {
  createMockProfileAssetsRepository,
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
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

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
    expect(profileAssetsRepository.uploadProfileAssets).toHaveBeenCalledWith({
      image: {
        content: expect.any(Uint8Array),
        contentType: "image/png",
        extension: "png",
      },
      logo: {
        content: expect.any(Uint8Array),
        contentType: "image/png",
        extension: "png",
      },
      operatorId: MOCK_OPERATOR_ID,
    });
  });

  it("should upload assets before creating the profile", async () => {
    const calls: string[] = [];
    const profileRepository = createMockProfileRepository({
      create: vi.fn().mockImplementation(async (profile) => {
        calls.push("profile");
        return ok(profile);
      }),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository({
      uploadProfileAssets: vi.fn().mockImplementation(async () => {
        calls.push("assets");
        return ok(undefined);
      }),
    });
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    await useCase(mockCreateProfileInput);

    expect(calls).toEqual(["assets", "profile"]);
  });

  it("should return ConflictError when profile already exists", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

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
    expect(profileAssetsRepository.uploadProfileAssets).not.toHaveBeenCalled();
  });

  it("should propagate repository errors from getByOperatorId", async () => {
    const repoError = new Error("DB connection failed");
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(err(repoError));
  });

  it("should propagate repository errors from create", async () => {
    const repoError = new Error("DB write failed");
    const profileRepository = createMockProfileRepository({
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(err(repoError));
  });

  it("should propagate ConflictError from create when a concurrent profile is created", async () => {
    const repoError = new ConflictError("Operator profile already exists");
    const profileRepository = createMockProfileRepository({
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    const result = await useCase(mockCreateProfileInput);
    expect(result).toEqual(err(repoError));
  });
});

describe("profile input validation", () => {
  it("should return ValidationError when operatorId is empty", async () => {
    const profileRepository = createMockProfileRepository();
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    const result = await useCase({ ...mockCreateProfileInput, operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileRepository.getByOperatorId).not.toHaveBeenCalled();
  });

  it("should return ValidationError when displayName is empty", async () => {
    const profileRepository = createMockProfileRepository();
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

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
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    const result = await useCase({
      ...mockCreateProfileInput,
      place: { ...mockCreateProfileInput.place, type: "invalid" as "online" },
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });
});

describe("profile asset validation", () => {
  it("should return ValidationError when an image is invalid", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    const result = await useCase({
      ...mockCreateProfileInput,
      image: new Blob(["not an image"], { type: "image/png" }),
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileAssetsRepository.uploadProfileAssets).not.toHaveBeenCalled();
    expect(profileRepository.create).not.toHaveBeenCalled();
  });
});

describe("profile asset orchestration", () => {
  it("should propagate profile asset errors without creating the profile", async () => {
    const assetError = new GenericError("Blob upload failed");
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository({
      uploadProfileAssets: vi.fn().mockResolvedValue(err(assetError)),
    });
    const useCase = makeOperatorCreateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
    );

    const result = await useCase(mockCreateProfileInput);

    expect(result).toEqual(err(assetError));
    expect(profileRepository.create).not.toHaveBeenCalled();
  });
});
