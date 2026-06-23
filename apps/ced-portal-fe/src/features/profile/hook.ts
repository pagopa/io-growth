import { useGetOperatorProfileQuery } from './api';

export const useOperatorProfile = () => {
  const query = useGetOperatorProfileQuery();

  const isOnline = query.data?.place.type === 'online';
  const isOffline = query.data?.place.type === 'offline';

  return {
    ...query,
    profile: query.data,
    isOnline,
    isOffline,
  };
};
