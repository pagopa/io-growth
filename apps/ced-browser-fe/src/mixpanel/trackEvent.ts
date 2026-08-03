import { trackEventBuilder } from '@pagopa/io-mixpanel';
import { EventProperties } from '@pagopa/io-mixpanel/dist/mixpanel';

export const sendEvent = trackEventBuilder(
  import.meta.env.VITE_ANALYTICS_ENABLE,
);

export const trackBrowserEvent = (
  event_name: string,
  properties?: EventProperties,
) => {
  sendEvent(event_name, { event_category: 'UX', ...properties, webview: true });
};
