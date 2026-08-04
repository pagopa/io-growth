import { describe, expect, it } from 'vitest';
import { setJpegDensityDpi, setPngDensityDpi } from '../utils';

describe('setJpegDensityDpi', () => {
  it('replaces browser canvas 1x1 aspect-ratio density with 72 DPI', async () => {
    const jpegBytes = new Uint8Array([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xd9,
    ]);
    const file = new File([jpegBytes], 'photo.jpg', { type: 'image/jpeg' });

    const processedFile = await setJpegDensityDpi(file);
    const processedBytes = new Uint8Array(await processedFile.arrayBuffer());

    expect(Array.from(processedBytes.slice(13, 18))).toEqual([1, 0, 72, 0, 72]);
  });
});

describe('setPngDensityDpi', () => {
  it('adds a 72 DPI pHYs chunk after IHDR', async () => {
    const pngBytes = new Uint8Array([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
      0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);
    const file = new File([pngBytes], 'photo.png', { type: 'image/png' });

    const processedFile = await setPngDensityDpi(file);
    const processedBytes = new Uint8Array(await processedFile.arrayBuffer());
    const densityChunkOffset = 33;

    expect(
      Array.from(
        processedBytes.slice(densityChunkOffset + 4, densityChunkOffset + 8),
      ),
    ).toEqual([0x70, 0x48, 0x59, 0x73]);
    expect(
      Array.from(
        processedBytes.slice(densityChunkOffset + 8, densityChunkOffset + 17),
      ),
    ).toEqual([0x00, 0x00, 0x0b, 0x13, 0x00, 0x00, 0x0b, 0x13, 0x01]);
  });
});
