import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

import { makeGetOperatorProfileUseCase } from "../get-operator-profile.use-case.js";

const mockOperatorData = {
  displayName: "Operatore Demo",
  operatorId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
  place: {
    id: "01JVMK3N8XQZP5T6G2WYHAB4CE",
    name: "Sportello remoto",
    supportContacts: [
      {
        id: "01JVMK3N8XQZP5T6G2WYHAB4CF",
        type: "email" as const,
        value: "support@example.org",
      },
    ],
    type: "online" as const,
    website: {
      url: "https://example.org",
    },
  },
};

const createMockProfileRepository = (
  data?: typeof mockOperatorData,
): ProfileRepository => ({
  create: vi.fn(),
  getByOperatorId: vi.fn().mockResolvedValue(ok(data)),
});

describe("makeGetOperatorProfileUseCase", () => {
  it("should return operator profile when profile exists", async () => {
    const profileRepository = createMockProfileRepository(mockOperatorData);
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      operatorId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
    });

    expect(result).toEqual(ok(mockOperatorData));
    expect(profileRepository.getByOperatorId).toHaveBeenCalledWith(
      "01JVMK3N8XQZP5T6G2WYHAB4CD",
    );
  });

  it("should return NotFoundError when profile does not exist", async () => {
    const profileRepository = createMockProfileRepository(undefined);
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      operatorId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
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
    const profileRepository: ProfileRepository = {
      create: vi.fn(),
      getByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    };
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({
      operatorId: "01JVMK3N8XQZP5T6G2WYHAB4CD",
    });

    expect(result).toEqual(err(repoError));
  });

  it("should return ValidationError when operatorId is empty", async () => {
    const profileRepository = createMockProfileRepository(undefined);
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({ operatorId: "" });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileRepository.getByOperatorId).not.toHaveBeenCalled();
  });
});
