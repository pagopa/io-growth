import type { Result } from "neverthrow";

import { ValidationError } from "@pagopa/io-core-domain/errors";
import { imageSize } from "image-size";
import { err, ok } from "neverthrow";

import type { ProfileAsset } from "../../../../domain/ports/outbound/profile-assets.repository.js";

const LOGO_MAX_HEIGHT = 300;
const LOGO_MAX_WIDTH = 300;
const IMAGE_MAX_HEIGHT = 600;
const IMAGE_MAX_WIDTH = 300;
const JPEG_CONTENT_TYPE = "image/jpeg";
const PNG_CONTENT_TYPE = "image/png";

export interface ValidatedOptionalProfileAssets {
  readonly image?: ProfileAsset;
  readonly logo?: ProfileAsset;
}

type AssetKind = "image" | "logo";

const getExpectedContentType = (
  type: string,
): ProfileAsset["contentType"] | undefined => {
  if (type === "jpg" || type === "jpeg") {
    return JPEG_CONTENT_TYPE;
  }
  if (type === "png") {
    return PNG_CONTENT_TYPE;
  }
  return undefined;
};

const hasMatchingFilenameExtension = (
  filename: string,
  contentType: ProfileAsset["contentType"],
): boolean =>
  contentType === PNG_CONTENT_TYPE
    ? /\.png$/i.test(filename)
    : /\.jpe?g$/i.test(filename);

export const validateProfileAsset = async (
  content: File,
  assetKind: AssetKind,
): Promise<Result<ProfileAsset, ValidationError>> => {
  const bytes = new Uint8Array(await content.arrayBuffer());

  try {
    const { height, type, width } = imageSize(bytes);
    const contentType = type ? getExpectedContentType(type) : undefined;

    if (
      !contentType ||
      content.type.toLowerCase() !== contentType ||
      !hasMatchingFilenameExtension(content.name, contentType)
    ) {
      return err(
        new ValidationError(
          `${assetKind} must be a PNG or JPEG image with a matching filename extension and content type`,
        ),
      );
    }

    const maxHeight = assetKind === "logo" ? LOGO_MAX_HEIGHT : IMAGE_MAX_HEIGHT;
    const maxWidth = assetKind === "logo" ? LOGO_MAX_WIDTH : IMAGE_MAX_WIDTH;

    if (width > maxWidth || height > maxHeight) {
      return err(
        new ValidationError(
          `${assetKind} dimensions must not exceed ${maxWidth}x${maxHeight}px`,
        ),
      );
    }

    return ok({
      content: bytes,
      contentType,
    });
  } catch {
    return err(
      new ValidationError(`${assetKind} must be a valid PNG or JPEG image`),
    );
  }
};

export const validateProfileAssets = async ({
  image,
  logo,
}: {
  readonly image: File;
  readonly logo: File;
}): Promise<
  Result<
    {
      readonly image: ProfileAsset;
      readonly logo: ProfileAsset;
    },
    ValidationError
  >
> => {
  const [validatedLogo, validatedImage] = await Promise.all([
    validateProfileAsset(logo, "logo"),
    validateProfileAsset(image, "image"),
  ]);

  if (validatedLogo.isErr()) {
    return err(validatedLogo.error);
  }
  if (validatedImage.isErr()) {
    return err(validatedImage.error);
  }

  return ok({
    image: validatedImage.value,
    logo: validatedLogo.value,
  });
};

export const validateOptionalProfileAssets = async ({
  image,
  logo,
}: {
  readonly image?: File;
  readonly logo?: File;
}): Promise<Result<ValidatedOptionalProfileAssets, ValidationError>> => {
  const [validatedLogo, validatedImage] = await Promise.all([
    logo === undefined ? undefined : validateProfileAsset(logo, "logo"),
    image === undefined ? undefined : validateProfileAsset(image, "image"),
  ]);

  if (validatedLogo?.isErr()) {
    return err(validatedLogo.error);
  }
  if (validatedImage?.isErr()) {
    return err(validatedImage.error);
  }

  return ok({
    ...(validatedImage?.isOk() && { image: validatedImage.value }),
    ...(validatedLogo?.isOk() && { logo: validatedLogo.value }),
  });
};
