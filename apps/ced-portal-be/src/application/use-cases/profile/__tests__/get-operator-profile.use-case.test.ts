import { NotFoundError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import type { ProfileRepository } from "../../../../domain/ports/outbound/persistence/profile.repository.js";

import { makeGetOperatorProfileUseCase } from "../get-operator-profile.use-case.js";

const mockOperatorData = {
  displayName: "Operatore Demo",
  place: {
    name: "Sportello remoto",
    supportContacts: [{ type: "email" as const, value: "support@example.org" }],
    type: "online" as const,
    website: "https://example.org",
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

    const result = await useCase({ operatorId: "operator-123" });

    expect(result.isOk()).toBe(true);
    expect(result._unsafeUnwrap()).toEqual(mockOperatorData);
    expect(profileRepository.getByOperatorId).toHaveBeenCalledWith(
      "operator-123",
    );
  });

  it("should return NotFoundError when profile does not exist", async () => {
    const profileRepository = createMockProfileRepository(undefined);
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({ operatorId: "operator-123" });

    expect(result.isErr()).toBe(true);
    expect(result._unsafeUnwrapErr()).toBeInstanceOf(NotFoundError);
    expect(result._unsafeUnwrapErr().message).toBe(
      "Unable to find Profile: not found",
    );
  });

  it("should propagate repository errors", async () => {
    const repoError = new Error("DB connection failed");
    const profileRepository: ProfileRepository = {
      create: vi.fn(),
      getByOperatorId: vi.fn().mockResolvedValue(err(repoError)),
    };
    const useCase = makeGetOperatorProfileUseCase(profileRepository);

    const result = await useCase({ operatorId: "operator-123" });

    expect(result.isErr()).toBe(true);
  });
});
