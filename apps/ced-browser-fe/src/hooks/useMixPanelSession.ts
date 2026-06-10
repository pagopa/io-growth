import { useEffect, useMemo } from 'react';
import { initAnalytics } from '@pagopa/io-mixpanel';
import { useLocation } from 'react-router-dom';
import { useAppSelector } from './store';
import { selectDeviceId } from '../core/auth/authSelectors';

export const useMixPanelSession = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const isEmptySearch = !search || search === '';

  const cachedDeviceId = useAppSelector(selectDeviceId);

  const deviceIdQuery = params.get('device');

  const deviceId = useMemo(
    () => (isEmptySearch ? cachedDeviceId : deviceIdQuery),
    [cachedDeviceId, deviceIdQuery, isEmptySearch],
  );

  useEffect(() => {
    if (deviceId) {
      initAnalytics(deviceId, {
        ANALYTICS_ENABLE: import.meta.env.VITE_ANALYTICS_ENABLE,
        ANALYTICS_TOKEN: import.meta.env.VITE_ANALYTICS_TOKEN || '',
        ANALYTICS_API_HOST: import.meta.env.VITE_ANALYTICS_API_HOST,
        ANALYTICS_PERSISTENCE: import.meta.env.VITE_ANALYTICS_PERSISTENCE,
        ANALYTICS_LOG_IP: import.meta.env.VITE_ANALYTICS_LOG_IP,
        ANALYTICS_DEBUG: import.meta.env.VITE_ANALYTICS_DEBUG,
      });
    }
  }, [deviceId]);
};
