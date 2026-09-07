import { describe, expect, it } from 'vitest';

import { toApiDateTime, toFormDate } from './date';

describe('request form date conversions', () => {
  it('round-trips a recovered date through the UI and API formats', () => {
    const formDate = toFormDate('1980-04-26T00:00:00Z');

    expect(formDate).toBe('26/04/1980');
    expect(toApiDateTime(formDate)).toBe('1980-04-26T00:00:00.000Z');
  });
});
