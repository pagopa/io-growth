import { describe, expect, it } from 'vitest';
import { setJpegDensityDpi } from '../utils';

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
