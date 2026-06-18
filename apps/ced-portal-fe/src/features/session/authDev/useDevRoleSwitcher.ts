import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../hooks';
import { getDevAssertionToken, getLandingRoute, Role } from './utils';
import { selectToken } from '../../../core/auth/authSelectors';
import { devAuthStorage } from './wrapper';
import { clearSession, setCredentials } from '../../../core/auth/authSlice';
import { APP_ROUTES } from '../../../app/routeConfig';

type Party = {
  id: string;
  name: string;
};

/**
 * DEV ONLY
 * Allows switching between local admin/operator contexts from the party dropdown.
 * This is not a production impersonation flow.
 */
export const useDevRoleSwitcher = (partyRoleMap: Record<string, Role>) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const token = useAppSelector(selectToken);

  return useCallback(
    (party: Party) => {
      if (!token) {
        return;
      }

      const role = partyRoleMap[party.id] ?? 'operator';
      const devToken = getDevAssertionToken(role);

      devAuthStorage.setSelectedPartyId(party.id);
      devAuthStorage.clearGuards();

      dispatch(clearSession());

      if (import.meta.env.DEV && devToken) {
        navigate(
          `${APP_ROUTES.AUTHORIZE}?token=${encodeURIComponent(devToken)}`,
          {
            replace: true,
          },
        );
        return;
      }

      dispatch(
        setCredentials({
          token,
          user: {
            id: party.id,
            name: party.name,
            email: `${party.id}@test.it`,
            role,
          },
        }),
      );

      navigate(getLandingRoute(role), { replace: true });
    },
    [dispatch, navigate, partyRoleMap, token],
  );
};
