import mixpanel from 'mixpanel-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initAnalytics, trackEventBuilder } from '../mixpanel';

vi.mock('mixpanel-browser', () => ({
  default: {
    init: vi.fn(),
    identify: vi.fn(),
    track: vi.fn(),
  },
}));

describe('analytics geolocation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('disables IP geolocation even with legacy configuration, preserving identification and tracking', () => {
    const config = {
      deviceId: 'test-device',
      ANALYTICS_ENABLE: true,
      ANALYTICS_TOKEN: 'test-token',
      ANALYTICS_API_HOST: 'https://analytics.example.test',
      ANALYTICS_PERSISTENCE: 'localStorage',
      ANALYTICS_LOG_IP: 'true',
      ANALYTICS_DEBUG: 'false',
    };

    initAnalytics(true, config);
    trackEventBuilder(true)('test-event', { event_category: 'UX' });

    expect(mixpanel.init).toHaveBeenCalledWith(
      'test-token',
      expect.objectContaining({ ip: false }),
    );
    expect(mixpanel.identify).toHaveBeenCalledWith('test-device');
    expect(mixpanel.track).toHaveBeenCalledWith(
      'test-event',
      { event_category: 'UX' },
      undefined,
      undefined,
    );
  });
});
