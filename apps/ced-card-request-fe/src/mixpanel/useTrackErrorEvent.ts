import { useEffect, useRef } from 'react';
import type { EventProperties } from '@pagopa/io-mixpanel/dist/mixpanel';
import { trackCardRequestEvent } from './trackEvent';

export const useTrackErrorEvent = (
  event_name: string,
  enabled: boolean = true,
  extraProperties?: EventProperties,
) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled) {
      hasTracked.current = false;
      return;
    }

    if (hasTracked.current) return;

    trackCardRequestEvent(event_name, {
      event_type: 'error',
      ...extraProperties,
    });

    hasTracked.current = true;
    // extraProperties intentionally omitted: track once per error occurrence
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event_name, enabled]);
};
