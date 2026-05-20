import { HeaderProduct } from '@pagopa/mui-italia';
import { Box, Typography } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsList, partyList, partyRoleMap } from './constants';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { setCredentials } from '../../core/auth/authSlice';
import { APP_ROUTES } from '../../app/routeConfig';
import { selectUser } from '../../core/auth/authSelectors';

export const PageHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);
  const handlePartyChange = useCallback(
    (party: { id: string; name: string }) => {
      const role = partyRoleMap[party.id] ?? 'operator';
      const isAdmin = role === 'admin';
      dispatch(
        setCredentials({
          token: 'mock-token',
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
    [dispatch, navigate],
  );

  useEffect(() => {
    handlePartyChange(partyList[1]);
    // Keeping an empty dependency array is intentional: adding deps (e.g. partyList/handlePartyChange)
    // would re-run this effect and overwrite user-selected party, breaking the initialization flow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!user) {
    return (
      <Box p={2}>
        <Typography color="text.secondary">Utente non disponibile.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ '& .MuiContainer-root': { px: { xs: 2, md: 3 } } }}>
      <HeaderProduct
        productsList={productsList}
        productId={productsList[0].id}
        partyList={partyList}
        partyId={user.id}
        onSelectedParty={handlePartyChange}
      />
    </Box>
  );
};
