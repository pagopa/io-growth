import { HeaderProduct } from '@pagopa/mui-italia';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsList, partyList, partyRoleMap } from './constants';
import { useAppDispatch } from '../../hooks';
import { setCredentials } from '../../core/auth/authSlice';
import { APP_ROUTES } from '../../app/routeConfig';

export const PageHeader = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const defaultParty = partyList[0];
    dispatch(
      setCredentials({
        token: 'mock-token',
        user: {
          id: defaultParty.id,
          name: defaultParty.name,
          email: `${defaultParty.id}@test.it`,
          role: partyRoleMap[defaultParty.id] ?? 'operator',
        },
      }),
    );
  }, [dispatch]);

  const handlePartyChange = (party: { id: string; name: string }) => {
    dispatch(
      setCredentials({
        token: 'mock-token',
        user: {
          id: party.id,
          name: party.name,
          email: `${party.id}@test.it`,
          role: partyRoleMap[party.id] ?? 'operator',
        },
      }),
    );
    navigate(APP_ROUTES.HOME);
  };

  return (
    <Box sx={{ '& .MuiContainer-root': { px: { xs: 2, md: 3 } } }}>
      <HeaderProduct
        productsList={productsList}
        productId={productsList[0].id}
        partyList={partyList}
        partyId={partyList[0].id}
        onSelectedParty={handlePartyChange}
      />
    </Box>
  );
};
