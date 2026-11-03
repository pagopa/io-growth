import { trackEventBuilder } from '@pagopa/io-mixpanel';

const isAnalyticsEnabled = import.meta.env.VITE_ANALYTICS_ENABLE === 'true';

export const sendEvent = trackEventBuilder(isAnalyticsEnabled);

export type EventProperties = Parameters<typeof sendEvent>[1];

export const trackCardRequestEvent = (
  event_name: string,
  properties?: EventProperties,
) => {
  sendEvent(event_name, { event_category: 'UX', ...properties, webview: true });
};
