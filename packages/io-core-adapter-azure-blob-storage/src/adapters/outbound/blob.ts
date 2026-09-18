import { DefaultAzureCredential } from "@azure/identity";
import { BlobServiceClient as AzureBlobServiceClient } from "@azure/storage-blob";
import { GenericError } from "@pagopa/io-core-domain/errors";
import { err, ok } from "neverthrow";

import type { BlobStorageConfig } from "../../config.js";
import type { BlobRepository } from "../../domain/ports/outbound/blob.repository.js";

export interface BlobContainerConfig extends BlobStorageConfig {
  readonly containerName: string;
}

const createCredential = (clientId?: string) =>
  new DefaultAzureCredential(
    clientId ? { managedIdentityClientId: clientId } : undefined,
  );

export const createBlobRepository = ({
  clientId,
  connectionString,
  containerName,
  endpoint,
}: BlobContainerConfig): BlobRepository => {
  const blobServiceClient = connectionString
    ? AzureBlobServiceClient.fromConnectionString(connectionString)
    : new AzureBlobServiceClient(endpoint, createCredential(clientId));
  const containerClient = blobServiceClient.getContainerClient(containerName);

  return {
    upload: async ({ blobName, content, contentType }) => {
      try {
        await containerClient.getBlockBlobClient(blobName).uploadData(content, {
          blobHTTPHeaders: {
            blobContentType: contentType,
          },
        });

        return ok(undefined);
      } catch (error) {
        return err(
          new GenericError(
            `Failed to upload blob ${containerName}/${blobName}: ${String(error)}`,
          ),
        );
      }
    },
  };
};
