import { HeaderProduct } from '@pagopa/mui-italia';
import { Box } from '@mui/material';
import { useCallback } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { productsList, partyList, partyRoleMap } from './constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setCredentials } from '../../core/auth/authSlice';
import { APP_ROUTES } from '../../app/routeConfig';
import {
  selectDeviceId,
  selectToken,
  selectUser,
} from '../../core/auth/authSelectors';

export const PageHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);
  const token = useAppSelector(selectToken);
  const deviceId = useAppSelector(selectDeviceId);
  const handlePartyChange = useCallback(
    (party: { id: string; name: string }) => {
      // Keep the session token issued by /authorize: auto-initializing with mock data here
      // would overwrite the persisted auth state and break authenticated API calls.
      if (!token) {
        return;
      }

      const role = partyRoleMap[party.id] ?? 'operator';
      const isAdmin = role === 'admin';
      dispatch(
        setCredentials({
          token,
          deviceId,
          user: {
            id: party.id,
            name: party.name,
            email: `${party.id}@test.it`,
            role,
          },
        }),
      );

      navigate(isAdmin ? APP_ROUTES.OPPORTUNITIES : APP_ROUTES.HOME);
    },
    [dispatch, navigate, token, deviceId],
  );

  if (!user) {
    return <Navigate replace to={APP_ROUTES.AUTHORIZE} />;
  }

  const selectedPartyId =
    partyList.find((party) => party.id === user.id)?.id ?? partyList[0]?.id;
  const selectedProductId = productsList[0]?.id;

  if (!selectedPartyId || !selectedProductId) {
    return null;
  }

  return (
    <Box sx={{ '& .MuiContainer-root': { px: { xs: 2, md: 3 } } }}>
      <HeaderProduct
        productsList={productsList}
        productId={selectedProductId}
        partyList={partyList}
        partyId={selectedPartyId}
        onSelectedParty={handlePartyChange}
      />
    </Box>
  );
};
