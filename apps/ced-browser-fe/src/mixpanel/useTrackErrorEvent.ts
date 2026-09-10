import { useEffect, useRef } from 'react';
import { trackBrowserEvent } from './trackEvent';

export const useTrackErrorEvent = (
  event_name: string,
  enabled: boolean = true,
) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled) {
      hasTracked.current = false;
      return;
    }

    if (hasTracked.current) return;

    trackBrowserEvent(event_name, {
      event_type: 'error',
    });

    hasTracked.current = true;
  }, [event_name, enabled]);
};
