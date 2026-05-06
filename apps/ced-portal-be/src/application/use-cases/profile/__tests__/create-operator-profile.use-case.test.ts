import { ConflictError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

import { makeCreateOperatorProfileUseCase } from "../create-operator-profile.use-case.js";

const mockOperatorData = {
  displayName: "Operatore Demo",
  place: {
    name: "Sportello remoto",
    supportContacts: [{ type: "email" as const, value: "support@example.org" }],
    type: "online" as const,
    website: "https://example.org",
  },
};

const createInput = {
  displayName: "Operatore Demo",
  operatorId: "operator-123",
  place: {
    name: "Sportello remoto",
    supportContacts: [{ type: "email" as const, value: "support@example.org" }],
    type: "online" as const,
    website: "https://example.org",
  },
};

const createMockProfileRepository = (
  existing?: typeof mockOperatorData,
): ProfileRepository => ({
  create: vi.fn().mockResolvedValue(ok(undefined)),
  getByOperatorId: vi.fn().mockResolvedValue(ok(existing)),
});

describe("makeCreateOperatorProfileUseCase", () => {
  it("should create operator profile when no profile exists", async () => {
    const profileRepository = createMockProfileRepository(undefined);
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

    expect(result).toEqual(ok(undefined));
    expect(profileRepository.getByOperatorId).toHaveBeenCalledWith(
      "operator-123",
    );
    expect(profileRepository.create).toHaveBeenCalledWith(createInput);
  });

  it("should return ConflictError when profile already exists", async () => {
    const profileRepository = createMockProfileRepository(mockOperatorData);
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

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
    const profileRepository: ProfileRepository = {
      create: vi.fn(),
      getByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    };
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

    expect(result).toEqual(err(repoError));
  });

  it("should propagate repository errors from create", async () => {
    const repoError = new Error("DB write failed");
    const profileRepository: ProfileRepository = {
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    };
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

    expect(result).toEqual(err(repoError));
  });

  it("should propagate ConflictError from create when a concurrent profile is created", async () => {
    const repoError = new ConflictError("Operator profile already exists");
    const profileRepository: ProfileRepository = {
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    };
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const profileRepository = createMockProfileRepository(undefined);
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase({ ...createInput, operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileRepository.getByOperatorId).not.toHaveBeenCalled();
  });

  it("should return ValidationError when displayName is empty", async () => {
    const profileRepository = createMockProfileRepository(undefined);
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase({ ...createInput, displayName: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });

  it("should return ValidationError when place has invalid type", async () => {
    const profileRepository = createMockProfileRepository(undefined);
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      ...createInput,
      place: { ...createInput.place, type: "invalid" as "online" },
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });
});
