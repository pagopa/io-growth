import type { BlobRepository } from "@pagopa/io-core-adapter-azure-blob-storage";

import { err, ok } from "neverthrow";

import type {
  ProfileAssetsRepository,
  UploadProfileAssetsInput,
} from "../../../domain/ports/outbound/profile-assets.repository.js";

export const createAzureProfileAssetsRepository = ({
  imagesRepository,
  logosRepository,
}: {
  readonly imagesRepository: BlobRepository;
  readonly logosRepository: BlobRepository;
}): ProfileAssetsRepository => ({
  uploadProfileAssets: async ({
    image,
    logo,
    operatorId,
  }: UploadProfileAssetsInput) => {
    const [logoResult, imageResult] = await Promise.all([
      logosRepository.upload({
        blobName: `${operatorId}.${logo.extension}`,
        content: logo.content,
        contentType: logo.contentType,
      }),
      imagesRepository.upload({
        blobName: `${operatorId}.${image.extension}`,
        content: image.content,
        contentType: image.contentType,
      }),
    ]);

    if (logoResult.isErr()) {
      return err(logoResult.error);
    }
    if (imageResult.isErr()) {
      return err(imageResult.error);
    }

    return ok(undefined);
  },
});
