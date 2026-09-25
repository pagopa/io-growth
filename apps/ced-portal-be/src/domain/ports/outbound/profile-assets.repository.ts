import type { GenericError } from "@pagopa/io-core-domain/errors";
import type { Result } from "neverthrow";

export interface ProfileAsset {
  readonly content: Uint8Array;
  readonly contentType: "image/jpeg" | "image/png";
}

export interface ProfileAssetsRepository {
  readonly storeProfileAssets: (
    input: StoreProfileAssetsInput,
  ) => Promise<Result<void, GenericError>>;
}

export interface StoreProfileAssetsInput {
  readonly image?: ProfileAsset;
  readonly logo?: ProfileAsset;
  readonly operatorId: string;
}
