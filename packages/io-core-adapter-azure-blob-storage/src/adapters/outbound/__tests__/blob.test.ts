import { BlobServiceClient } from "@azure/storage-blob";
import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { createBlobRepository } from "../blob.js";

vi.mock("@azure/identity", () => ({
  DefaultAzureCredential: vi.fn(),
}));

vi.mock("@azure/storage-blob", () => ({
  BlobServiceClient: Object.assign(vi.fn(), {
    fromConnectionString: vi.fn(),
  }),
}));

describe("createBlobRepository", () => {
  const uploadData = vi.fn();
  const getBlockBlobClient = vi.fn().mockReturnValue({ uploadData });
  const getContainerClient = vi.fn().mockReturnValue({ getBlockBlobClient });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(BlobServiceClient).mockImplementation(
      () => ({ getContainerClient }) as never,
    );
    vi.mocked(BlobServiceClient.fromConnectionString).mockReturnValue({
      getContainerClient,
    } as never);
    uploadData.mockResolvedValue(ok(undefined));
  });

  it("uploads the blob to the configured container with its content type", async () => {
    const repository = createBlobRepository({
      clientId: "client-id",
      containerName: "logos",
      endpoint: "https://storage.blob.core.windows.net",
    });
    const content = new Uint8Array([1, 2, 3]);

    const result = await repository.upload({
      blobName: "operator-id",
      content,
      contentType: "image/png",
    });

    expect(result).toEqual(ok(undefined));
    expect(getContainerClient).toHaveBeenCalledWith("logos");
    expect(getBlockBlobClient).toHaveBeenCalledWith("operator-id");
    expect(uploadData).toHaveBeenCalledWith(content, {
      blobHTTPHeaders: { blobContentType: "image/png" },
    });
  });

  it("maps Azure failures to a GenericError", async () => {
    uploadData.mockRejectedValueOnce(new Error("storage unavailable"));
    const repository = createBlobRepository({
      containerName: "images",
      endpoint: "https://storage.blob.core.windows.net",
    });

    const result = await repository.upload({
      blobName: "operator-id",
      content: new Uint8Array([1]),
      contentType: "image/jpeg",
    });

    expect(result).toEqual(err(expect.any(GenericError)));
  });

  it("uses the configured connection string instead of Entra ID credentials", async () => {
    const connectionString =
      "DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;";
    const repository = createBlobRepository({
      connectionString,
      containerName: "images",
      endpoint: "http://azurite:10000/devstoreaccount1",
    });

    await repository.upload({
      blobName: "operator-id",
      content: new Uint8Array([1]),
      contentType: "image/jpeg",
    });

    expect(BlobServiceClient.fromConnectionString).toHaveBeenCalledWith(
      connectionString,
    );
    expect(BlobServiceClient).not.toHaveBeenCalled();
  });
});
