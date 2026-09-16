import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface ProfileAsset {
  readonly content: Uint8Array;
  readonly contentType: "image/jpeg" | "image/png";
  readonly extension: "jpg" | "png";
}

export interface ProfileAssetsRepository {
  readonly uploadProfileAssets: (
    input: UploadProfileAssetsInput,
  ) => Promise<Result<void, GenericError>>;
}

export interface UploadProfileAssetsInput {
  readonly image: ProfileAsset;
  readonly logo: ProfileAsset;
  readonly operatorId: string;
}
