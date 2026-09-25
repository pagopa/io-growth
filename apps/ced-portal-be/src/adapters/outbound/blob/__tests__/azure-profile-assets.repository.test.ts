import type { BlobRepository } from "@pagopa/io-core-adapter-azure-blob-storage";

import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { createAzureProfileAssetsRepository } from "../azure-profile-assets.repository.js";

const createAsset = ({
  content = new Uint8Array([0, 1, 2, 255]),
  contentType = "image/png",
}: {
  readonly content?: Uint8Array;
  readonly contentType?: "image/jpeg" | "image/png";
} = {}) => ({
  content,
  contentType,
});

const createBlobMock = (): BlobRepository => ({
  upload: vi.fn().mockResolvedValue(ok(undefined)),
});

describe("createAzureProfileAssetsRepository", () => {
  it("stores Base64 assets under extensionless operator IDs with image metadata", async () => {
    const logosRepository = createBlobMock();
    const imagesRepository = createBlobMock();
    const repository = createAzureProfileAssetsRepository({
      imagesRepository,
      logosRepository,
    });
    const image = createAsset();
    const logo = createAsset({ contentType: "image/jpeg" });

    const result = await repository.storeProfileAssets({
      image,
      logo,
      operatorId: "operator-id",
    });

    expect(result).toEqual(ok(undefined));
    expect(logosRepository.upload).toHaveBeenCalledWith({
      blobName: "operator-id",
      content: new TextEncoder().encode(
        Buffer.from(logo.content).toString("base64"),
      ),
      contentType: "text/plain; charset=utf-8",
      metadata: { imagecontenttype: "image/jpeg" },
    });
    expect(imagesRepository.upload).toHaveBeenCalledWith({
      blobName: "operator-id",
      content: new TextEncoder().encode(
        Buffer.from(image.content).toString("base64"),
      ),
      contentType: "text/plain; charset=utf-8",
      metadata: { imagecontenttype: "image/png" },
    });
  });

  it("stores only supplied assets and leaves omitted assets untouched", async () => {
    const logosRepository = createBlobMock();
    const imagesRepository = createBlobMock();
    const repository = createAzureProfileAssetsRepository({
      imagesRepository,
      logosRepository,
    });

    const result = await repository.storeProfileAssets({
      logo: createAsset(),
      operatorId: "operator-id",
    });

    expect(result).toEqual(ok(undefined));
    expect(logosRepository.upload).toHaveBeenCalledOnce();
    expect(imagesRepository.upload).not.toHaveBeenCalled();
  });

  it("does not call storage when no assets are supplied", async () => {
    const logosRepository = createBlobMock();
    const imagesRepository = createBlobMock();
    const repository = createAzureProfileAssetsRepository({
      imagesRepository,
      logosRepository,
    });

    const result = await repository.storeProfileAssets({
      operatorId: "operator-id",
    });

    expect(result).toEqual(ok(undefined));
    expect(logosRepository.upload).not.toHaveBeenCalled();
    expect(imagesRepository.upload).not.toHaveBeenCalled();
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

    const result = await repository.storeProfileAssets({
      image: createAsset(),
      logo: createAsset(),
      operatorId: "operator-id",
    });

    expect(result).toEqual(err(storageError));
  });
});
