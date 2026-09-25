import type { BlobRepository } from "@pagopa/io-core-adapter-azure-blob-storage";

import { err, ok } from "neverthrow";

import type {
  ProfileAsset,
  ProfileAssetsRepository,
  StoreProfileAssetsInput,
} from "../../../domain/ports/outbound/profile-assets.repository.js";

const uploadAsset = async ({
  asset,
  blobRepository,
  operatorId,
}: {
  readonly asset: ProfileAsset;
  readonly blobRepository: BlobRepository;
  readonly operatorId: string;
}) =>
  blobRepository.upload({
    blobName: operatorId,
    content: new TextEncoder().encode(
      Buffer.from(asset.content).toString("base64"),
    ),
    contentType: "text/plain; charset=utf-8",
    metadata: {
      imagecontenttype: asset.contentType,
    },
  });

export const createAzureProfileAssetsRepository = ({
  imagesRepository,
  logosRepository,
}: {
  readonly imagesRepository: BlobRepository;
  readonly logosRepository: BlobRepository;
}): ProfileAssetsRepository => ({
  storeProfileAssets: async ({
    image,
    logo,
    operatorId,
  }: StoreProfileAssetsInput) => {
    const [logoResult, imageResult] = await Promise.all([
      logo
        ? uploadAsset({
            asset: logo,
            blobRepository: logosRepository,
            operatorId,
          })
        : undefined,
      image
        ? uploadAsset({
            asset: image,
            blobRepository: imagesRepository,
            operatorId,
          })
        : undefined,
    ]);

    if (logoResult?.isErr()) {
      return err(logoResult.error);
    }
    if (imageResult?.isErr()) {
      return err(imageResult.error);
    }

    return ok(undefined);
  },
});
