import { describe, expect, it } from 'vitest';
import {
  getPhotoDensityDpi,
  setJpegDensityDpi,
  setPngDensityDpi,
  validatePhotoDensityDpi,
} from '../utils';

const createJpeg = (densityUnit: number, xDensity: number, yDensity: number) =>
  new File(
    [
      new Uint8Array([
        0xff,
        0xd8,
        0xff,
        0xe0,
        0x00,
        0x10,
        0x4a,
        0x46,
        0x49,
        0x46,
        0x00,
        0x01,
        0x01,
        densityUnit,
        xDensity >> 8,
        xDensity & 0xff,
        yDensity >> 8,
        yDensity & 0xff,
        0x00,
        0x00,
        0xff,
        0xd9,
      ]),
    ],
    'photo.jpg',
    { type: 'image/jpeg' },
  );

const createPng = (pixelsPerMeter?: number) => {
  const densityChunk =
    pixelsPerMeter === undefined
      ? []
      : [
          0x00,
          0x00,
          0x00,
          0x09,
          0x70,
          0x48,
          0x59,
          0x73,
          (pixelsPerMeter >>> 24) & 0xff,
          (pixelsPerMeter >>> 16) & 0xff,
          (pixelsPerMeter >>> 8) & 0xff,
          pixelsPerMeter & 0xff,
          (pixelsPerMeter >>> 24) & 0xff,
          (pixelsPerMeter >>> 16) & 0xff,
          (pixelsPerMeter >>> 8) & 0xff,
          pixelsPerMeter & 0xff,
          0x01,
          0x00,
          0x00,
          0x00,
          0x00,
        ];

  return new File(
    [
      new Uint8Array([
        0x89,
        0x50,
        0x4e,
        0x47,
        0x0d,
        0x0a,
        0x1a,
        0x0a,
        0x00,
        0x00,
        0x00,
        0x0d,
        0x49,
        0x48,
        0x44,
        0x52,
        0x00,
        0x00,
        0x00,
        0x01,
        0x00,
        0x00,
        0x00,
        0x01,
        0x08,
        0x02,
        0x00,
        0x00,
        0x00,
        0x90,
        0x77,
        0x53,
        0xde,
        ...densityChunk,
        0x00,
        0x00,
        0x00,
        0x00,
        0x49,
        0x45,
        0x4e,
        0x44,
        0xae,
        0x42,
        0x60,
        0x82,
      ]),
    ],
    'photo.png',
    { type: 'image/png' },
  );
};

describe('photo density metadata', () => {
  it('reads JPEG density and detects missing physical units', async () => {
    await expect(getPhotoDensityDpi(createJpeg(1, 300, 300))).resolves.toBe(
      300,
    );
    await expect(getPhotoDensityDpi(createJpeg(0, 1, 1))).resolves.toBeNull();
  });

  it('reads PNG density', async () => {
    await expect(getPhotoDensityDpi(createPng(2834))).resolves.toBeCloseTo(
      71.98,
      2,
    );
  });

  it('restores the requested JPEG density', async () => {
    const processedFile = await setJpegDensityDpi(createJpeg(0, 1, 1), 300);
    const processedBytes = new Uint8Array(await processedFile.arrayBuffer());

    expect(Array.from(processedBytes.slice(13, 18))).toEqual([
      1, 0x01, 0x2c, 0x01, 0x2c,
    ]);
  });

  it('adds the requested PNG density', async () => {
    const processedFile = await setPngDensityDpi(createPng(), 300);
    const processedBytes = new Uint8Array(await processedFile.arrayBuffer());

    expect(Array.from(processedBytes.slice(41, 50))).toEqual([
      0x00, 0x00, 0x2e, 0x23, 0x00, 0x00, 0x2e, 0x23, 0x01,
    ]);
  });

  it('rejects an explicit input density below 72 DPI', () => {
    expect(() => validatePhotoDensityDpi(71.98)).toThrow(
      'La densità della foto deve essere di almeno 72 DPI.',
    );
  });

  it('accepts valid or missing input density', () => {
    expect(() => validatePhotoDensityDpi(72)).not.toThrow();
    expect(() => validatePhotoDensityDpi(300)).not.toThrow();
    expect(() => validatePhotoDensityDpi(null)).not.toThrow();
  });
});
