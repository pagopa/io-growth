import { HeaderProduct } from '@pagopa/mui-italia';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { productsList, partyList, partyRoleMap } from './constants';
import { useAppSelector } from '../../hooks';
import { APP_ROUTES } from '../../app/routeConfig';
import { selectUser } from '../../core/auth/authSelectors';
import { useDevRoleSwitcher } from '../../features/session/authDev/useDevRoleSwitcher';
import { devAuthStorage } from '../../features/session/authDev/wrapper';

export const PageHeader = () => {
  const user = useAppSelector(selectUser);
  const switchDevPartyContext = useDevRoleSwitcher(partyRoleMap);

  if (!user) {
    return <Navigate replace to={APP_ROUTES.AUTHORIZE} />;
  }

  const savedPartyId = devAuthStorage.getSelectedPartyId();
  const selectedPartyId =
    partyList.find((party) => party.id === user.id)?.id ??
    partyList.find((party) => partyRoleMap[party.id] === user.role)?.id ??
    (savedPartyId && partyList.some((party) => party.id === savedPartyId)
      ? savedPartyId
      : undefined) ??
    partyList[0]?.id;

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
        onSelectedParty={switchDevPartyContext}
      />
    </Box>
  );
};
