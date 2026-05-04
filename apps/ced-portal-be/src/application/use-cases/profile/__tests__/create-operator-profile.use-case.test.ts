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

    expect(result.isOk()).toBe(true);
    expect(profileRepository.getByOperatorId).toHaveBeenCalledWith(
      "operator-123",
    );
    expect(profileRepository.create).toHaveBeenCalledWith(createInput);
  });

  it("should return ConflictError when profile already exists", async () => {
    const profileRepository = createMockProfileRepository(mockOperatorData);
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(ConflictError);
    expect(result._unsafeUnwrapErr().message).toBe(
      "Conflict: Operator profile already exists",
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

    expect(result.isErr()).toBe(true);
  });

  it("should propagate repository errors from create", async () => {
    const repoError = new Error("DB write failed");
    const profileRepository: ProfileRepository = {
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    };
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

    expect(result.isErr()).toBe(true);
  });

  it("should propagate ConflictError from create when a concurrent profile is created", async () => {
    const repoError = new ConflictError("Operator profile already exists");
    const profileRepository: ProfileRepository = {
      create: vi.fn().mockResolvedValue(err(repoError)),
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    };
    const useCase = makeCreateOperatorProfileUseCase(profileRepository);

    const result = await useCase(createInput);

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBe(repoError);
  });
});
