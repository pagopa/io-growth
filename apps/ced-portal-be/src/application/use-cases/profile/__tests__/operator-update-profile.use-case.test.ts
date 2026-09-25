import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { makeOperatorUpdateProfileUseCase } from "../operator-update-profile.use-case.js";
import {
  createMockProfileAssetsRepository,
  createMockProfileRepository,
  MOCK_OPERATOR_ID,
  MOCK_SUPPORT_CONTACT_ID,
  mockProfile,
} from "./mocks.js";

const updateInput = {
  contactEmail: "updated@example.org",
  displayName: "Updated operator",
  operatorId: MOCK_OPERATOR_ID,
  place: {
    address: {
      city: "Roma",
      country: "IT",
      postalCode: "00100",
      state: "RM",
      street: "Via Roma 1",
    },
    name: "Physical office",
    supportContacts: [],
    type: "offline" as const,
  },
};

const createMaterializedViewRepository = (
  refreshAll = vi.fn().mockResolvedValue(ok(undefined)),
) => ({ refreshAll });

describe("makeOperatorUpdateProfileUseCase", () => {
  it("replaces profile fields, keeps the place ID, and removes omitted contacts", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
      updateByOperatorId: vi
        .fn()
        .mockImplementation(async (profile) => ok(profile)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const materializedViewRepository = createMaterializedViewRepository();
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
      materializedViewRepository,
    );

    const result = await useCase(updateInput);

    expect(result).toEqual(
      ok({
        ...updateInput,
        place: {
          ...updateInput.place,
          id: mockProfile.place.id,
        },
      }),
    );
    expect(profileRepository.updateByOperatorId).toHaveBeenCalledWith({
      ...updateInput,
      place: {
        ...updateInput.place,
        id: mockProfile.place.id,
      },
    });
    expect(profileAssetsRepository.storeProfileAssets).not.toHaveBeenCalled();
    expect(materializedViewRepository.refreshAll).toHaveBeenCalledOnce();
  });

  it("validates and replaces only the supplied image", async () => {
    const image = new File(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      "profile.png",
      { type: "image/png" },
    );
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
      updateByOperatorId: vi
        .fn()
        .mockImplementation(async (profile) => ok(profile)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
      createMaterializedViewRepository(),
    );

    const result = await useCase({ ...updateInput, image });

    expect(result.isOk()).toBe(true);
    expect(profileAssetsRepository.storeProfileAssets).toHaveBeenCalledWith({
      image: {
        content: expect.any(Uint8Array),
        contentType: "image/png",
      },
      operatorId: MOCK_OPERATOR_ID,
    });
  });

  it("keeps matching contact IDs and creates IDs for new contacts", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
      updateByOperatorId: vi
        .fn()
        .mockImplementation(async (profile) => ok(profile)),
    });
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      createMockProfileAssetsRepository(),
      createMaterializedViewRepository(),
    );
    const input = {
      ...updateInput,
      place: {
        name: "Sportello aggiornato",
        supportContacts: [
          { type: "email" as const, value: "support@example.org" },
          { type: "phone" as const, value: "+390000000000" },
        ],
        type: "online" as const,
        website: { url: "https://updated.example.org" },
      },
    };

    await useCase(input);

    expect(profileRepository.updateByOperatorId).toHaveBeenCalledWith(
      expect.objectContaining({
        place: expect.objectContaining({
          id: mockProfile.place.id,
          supportContacts: [
            {
              id: MOCK_SUPPORT_CONTACT_ID,
              type: "email",
              value: "support@example.org",
            },
            {
              id: expect.stringMatching(/^[0-9A-HJKMNP-TV-Z]{26}$/),
              type: "phone",
              value: "+390000000000",
            },
          ],
        }),
      }),
    );
  });
});

describe("makeOperatorUpdateProfileUseCase error handling", () => {
  it("rejects an invalid supplied asset without updating storage or profile", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const materializedViewRepository = createMaterializedViewRepository();
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
      materializedViewRepository,
    );

    const result = await useCase({
      ...updateInput,
      logo: new File(["not an image"], "logo.png", { type: "image/png" }),
    });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(profileAssetsRepository.storeProfileAssets).not.toHaveBeenCalled();
    expect(profileRepository.updateByOperatorId).not.toHaveBeenCalled();
    expect(materializedViewRepository.refreshAll).not.toHaveBeenCalled();
  });

  it("returns not found without changing assets when the profile does not exist", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository();
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
      createMaterializedViewRepository(),
    );

    const result = await useCase(updateInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
    expect(profileAssetsRepository.storeProfileAssets).not.toHaveBeenCalled();
    expect(profileRepository.updateByOperatorId).not.toHaveBeenCalled();
  });

  it("returns not found if the profile is removed before the update commits", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
      updateByOperatorId: vi.fn().mockResolvedValue(ok(undefined)),
    });
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      createMockProfileAssetsRepository(),
      createMaterializedViewRepository(),
    );

    const result = await useCase(updateInput);

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "NotFoundError" })),
    );
  });

  it("does not update profile data when replacing assets fails", async () => {
    const storageError = new GenericError("blob storage unavailable");
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
    });
    const profileAssetsRepository = createMockProfileAssetsRepository({
      storeProfileAssets: vi.fn().mockResolvedValue(err(storageError)),
    });
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      profileAssetsRepository,
      createMaterializedViewRepository(),
    );
    const image = new File(
      [
        Buffer.from(
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
          "base64",
        ),
      ],
      "profile.png",
      { type: "image/png" },
    );

    const result = await useCase({ ...updateInput, image });

    expect(result).toEqual(err(storageError));
    expect(profileRepository.updateByOperatorId).not.toHaveBeenCalled();
  });

  it("treats materialized-view refresh as best effort after the update", async () => {
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(ok(mockProfile)),
      updateByOperatorId: vi
        .fn()
        .mockImplementation(async (profile) => ok(profile)),
    });
    const materializedViewRepository = createMaterializedViewRepository();
    materializedViewRepository.refreshAll.mockResolvedValue(
      err(new GenericError("refresh failed")),
    );
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      createMockProfileAssetsRepository(),
      materializedViewRepository,
    );

    const result = await useCase(updateInput);

    expect(result.isOk()).toBe(true);
  });

  it("propagates profile repository failures", async () => {
    const repositoryError = new GenericError("database unavailable");
    const profileRepository = createMockProfileRepository({
      getByOperatorId: vi.fn().mockResolvedValue(err(repositoryError)),
    });
    const useCase = makeOperatorUpdateProfileUseCase(
      profileRepository,
      createMockProfileAssetsRepository(),
      createMaterializedViewRepository(),
    );

    const result = await useCase(updateInput);

    expect(result).toEqual(err(repositoryError));
  });
});
