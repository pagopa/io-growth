import { useEffect, useRef } from 'react';
import { trackCardRequestEvent } from './trackEvent';

export const useTrackLandedInPage = (
  event_name: string,
  extraProperties?: Record<string, string | number>,
  enabled: boolean = true,
) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || hasTracked.current) return;

    trackCardRequestEvent(event_name, {
      event_type: 'screen_view',
      ...(extraProperties ?? {}),
    });

    hasTracked.current = true;
  }, [event_name, extraProperties, enabled]);
};
