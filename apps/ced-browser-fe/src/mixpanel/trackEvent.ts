import { trackEventBuilder } from '@pagopa/io-mixpanel';
import { EventProperties } from '@pagopa/io-mixpanel/dist/mixpanel';

const isAnalyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLE === 'true';

export const sendEvent = trackEventBuilder(isAnalyticsEnabled);

export const trackBrowserEvent = (
  event_name: string,
  properties?: EventProperties,
) => {
  sendEvent(event_name, { event_category: 'UX', ...properties, webview: true });
};
