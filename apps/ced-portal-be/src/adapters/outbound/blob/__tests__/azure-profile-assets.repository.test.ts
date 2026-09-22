import type { BlobRepository } from "@pagopa/io-core-adapter-azure-blob-storage";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { createAzureProfileAssetsRepository } from "../azure-profile-assets.repository.js";

const createAsset = ({
  contentType = "image/png",
  extension = "png",
}: {
  readonly contentType?: "image/jpeg" | "image/png";
  readonly extension?: "jpg" | "png";
} = {}) => ({
  content: new Uint8Array([1, 2, 3]),
  contentType,
  extension,
});

const createBlobMock = (): BlobRepository => ({
  upload: vi.fn().mockResolvedValue(ok(undefined)),
});

describe("createAzureProfileAssetsRepository", () => {
  it("uploads normalized assets under the operator ID", async () => {
    const logosRepository = createBlobMock();
    const imagesRepository = createBlobMock();
    const repository = createAzureProfileAssetsRepository({
      imagesRepository,
      logosRepository,
    });
    const image = createAsset();
    const logo = createAsset({
      contentType: "image/jpeg",
      extension: "jpg",
    });

    const result = await repository.uploadProfileAssets({
      image,
      logo,
      operatorId: "operator-id",
    });

    expect(result).toEqual(ok(undefined));
    expect(logosRepository.upload).toHaveBeenCalledWith({
      blobName: "operator-id.jpg",
      content: logo.content,
      contentType: "image/jpeg",
    });
    expect(imagesRepository.upload).toHaveBeenCalledWith({
      blobName: "operator-id.png",
      content: image.content,
      contentType: "image/png",
    });
  });

  it("propagates storage errors", async () => {
    const storageError = new GenericError("storage unavailable");
    const logosRepository: BlobRepository = {
      upload: vi.fn().mockResolvedValue(err(storageError)),
    };
    const imagesRepository = createBlobMock();
    const repository = createAzureProfileAssetsRepository({
      imagesRepository,
      logosRepository,
    });

    const result = await repository.uploadProfileAssets({
      image: createAsset(),
      logo: createAsset(),
      operatorId: "operator-id",
    });

    expect(result).toEqual(err(storageError));
  });
});
