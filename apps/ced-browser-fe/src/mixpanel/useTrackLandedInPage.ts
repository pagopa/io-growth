import { useEffect, useRef } from 'react';
import { trackBrowserEvent } from './trackEvent';

export const useTrackLandedInPage = (
  event_name: string,
  extraProperties?: Record<string, string>,
  enabled: boolean = true,
) => {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (!enabled || hasTracked.current) return;

    trackBrowserEvent(event_name, {
      event_type: 'screen_view',
      ...(extraProperties ?? {}),
    });

    hasTracked.current = true;
  }, [event_name, enabled]);
};
