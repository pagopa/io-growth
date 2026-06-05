import mixpanel, { Persistence } from 'mixpanel-browser';

import { isEnvConfigEnabled } from './utils';

type CONFIG = {
  ANALYTICS_ENABLE: string;
  ANALYTICS_TOKEN: string;
  ANALYTICS_API_HOST: string;
  ANALYTICS_PERSISTENCE: string;
  ANALYTICS_LOG_IP: string;
  ANALYTICS_DEBUG: string;
};

type EventCategory = 'KO' | 'UX' | 'TECH';

type WindowMPValues = {
  initMixPanel?: boolean;
} & Window;

type EventType = 'error' | 'screen_view' | undefined;

export interface EventProperties {
  [key: string]: unknown;
  event_category?: EventCategory;
  event_type?: EventType;
}

/** To call in order to start the analytics service, otherwise no event will be sent */
export const initAnalytics = (
  deviceId: string | undefined,
  {
    ANALYTICS_API_HOST,
    ANALYTICS_DEBUG,
    ANALYTICS_LOG_IP,
    ANALYTICS_ENABLE,
    ANALYTICS_PERSISTENCE,
    ANALYTICS_TOKEN,
  }: CONFIG,
): void => {
  console.log('Initializing analytics with deviceId:', {
    deviceId,
    ANALYTICS_API_HOST,
    ANALYTICS_DEBUG,
    ANALYTICS_LOG_IP,
    ANALYTICS_ENABLE,
    ANALYTICS_PERSISTENCE,
    ANALYTICS_TOKEN,
  });
  if (ANALYTICS_ENABLE && !(window as WindowMPValues).initMixPanel && !!deviceId) {
    mixpanel.init(ANALYTICS_TOKEN, {
      api_host: ANALYTICS_API_HOST,
      cookie_domain: '.ioapp.it', // change this value with your dev domain
      cookie_expiration: 0,
      debug: isEnvConfigEnabled(ANALYTICS_DEBUG),
      ip: isEnvConfigEnabled(ANALYTICS_LOG_IP),
      persistence: ANALYTICS_PERSISTENCE as Persistence,
      secure_cookie: true, // change this value as false if you run in local .env
    });

    mixpanel.identify(deviceId);

    (window as WindowMPValues).initMixPanel = true;
  }
};

/**
 * To notify an event through the analytics tool:
 * @property event_name: the name of the event
 * @property properties: the additional payload sent with the event
 * @property callback: an action taken when the track has completed (If the action taken immediately after the track is an exit action from the application, it's better to use this callback to perform the exit, in order to give to mixPanel the time to send the event)
 */
export const trackEventBuilder =
  (ANALYTICS_ENABLE: string) =>
  (event_name: string, properties?: EventProperties, callback?: () => void): void => {
    //TODO: for test only, remove console.log before release
    console.log(
      'invoked trackEventBuilder with event_name:',
      event_name,
      'and properties:',
      properties,
    );
    if (ANALYTICS_ENABLE && (window as WindowMPValues).initMixPanel) {
      trackEventThroughAnalyticTool(event_name, properties, callback);
    } else {
      if (callback) {
        callback();
      }
    }
  };

const trackEventThroughAnalyticTool = (
  event_name: string,
  properties?: EventProperties,
  callback?: () => void,
): void => {
  let called = false;
  const wrappedCallback = callback
    ? () => {
        try {
          called = true;
          callback();
        } catch (reason) {
          // eslint-disable-next-line no-console
          console.error(
            `Something gone wrong while calling trackEvent ${event_name} callback`,
            reason,
          );
        }
      }
    : undefined;
  try {
    mixpanel.track(
      event_name,
      {
        ...properties,
      },
      wrappedCallback ? { send_immediately: true } : undefined,
      wrappedCallback,
    );
  } catch (reason) {
    // eslint-disable-next-line no-console
    console.error('Something gone wrong while sending data to mixpanel:', reason);

    if (wrappedCallback && !called) {
      wrappedCallback();
    }
  }
};
