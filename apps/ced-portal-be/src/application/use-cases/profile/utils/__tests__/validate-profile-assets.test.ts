import { err, ok } from "neverthrow";
import { describe, expect, it } from "vitest";

import { validateProfileAssets } from "../validate-profile-assets.js";

const ONE_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
  "base64",
);
const ONE_PIXEL_JPEG = Buffer.from(
  "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////2wBDAf//////////////////////////////////////////////////////////////////////////////////////wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAX/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEDAQE/AYf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AYf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAH/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAEFAqf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAECAQE/AYf/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAY/Aqf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/9oACAEBAAE/IX//2gAMAwEAAgADAAAAEP/EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQMBAT8QH//EABQRAQAAAAAAAAAAAAAAAAAAABD/2gAIAQIBAT8QH//EABQQAQAAAAAAAAAAAAAAAAAAABD/2gAIAQEAAT8QH//Z",
  "base64",
);

const png = (
  width: number,
  height: number,
  type = "image/png",
  filename = "asset.png",
): File => {
  const content = Buffer.from(ONE_PIXEL_PNG);
  content.writeUInt32BE(width, 16);
  content.writeUInt32BE(height, 20);
  return new File([content], filename, { type });
};

describe("validateProfileAssets", () => {
  it("validates dimensions and returns normalized assets", async () => {
    const result = await validateProfileAssets({
      image: png(300, 600),
      logo: png(300, 300),
    });

    expect(result).toEqual(
      ok({
        image: {
          content: expect.any(Uint8Array),
          contentType: "image/png",
        },
        logo: {
          content: expect.any(Uint8Array),
          contentType: "image/png",
        },
      }),
    );
  });

  it.each([
    ["logo", png(301, 300), png(1, 1)],
    ["image", png(1, 1), png(301, 600)],
  ])("rejects an oversized %s", async (_assetKind, logo, image) => {
    const result = await validateProfileAssets({ image, logo });

    expect(result).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });

  it("accepts JPEG assets with a case-insensitive filename extension", async () => {
    const result = await validateProfileAssets({
      image: png(1, 1),
      logo: new File([ONE_PIXEL_JPEG], "logo.JPEG", { type: "image/jpeg" }),
    });

    expect(result).toEqual(
      ok({
        image: {
          content: expect.any(Uint8Array),
          contentType: "image/png",
        },
        logo: {
          content: expect.any(Uint8Array),
          contentType: "image/jpeg",
        },
      }),
    );
  });

  it("rejects malformed images and mismatched content types", async () => {
    const malformedResult = await validateProfileAssets({
      image: new File(["not an image"], "image.png", { type: "image/png" }),
      logo: png(1, 1),
    });
    const mismatchedResult = await validateProfileAssets({
      image: png(1, 1),
      logo: png(1, 1, "image/jpeg"),
    });
    const mismatchedExtensionResult = await validateProfileAssets({
      image: png(1, 1, "image/png", "image.jpg"),
      logo: png(1, 1),
    });

    expect(malformedResult).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(mismatchedResult).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
    expect(mismatchedExtensionResult).toEqual(
      err(expect.objectContaining({ kind: "ValidationError" })),
    );
  });
});
