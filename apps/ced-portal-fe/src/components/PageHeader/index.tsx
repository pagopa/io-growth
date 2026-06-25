import { HeaderProduct } from '@pagopa/mui-italia';
import { Box } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { productsList, partyList, partyRoleMap } from './constants';
import { useAppSelector } from '../../hooks';
import { APP_ROUTES } from '../../app/routeConfig';
import { selectUser } from '../../core/auth/authSelectors';
import { useDevRoleSwitcher } from '../../features/session/authDev/useDevRoleSwitcher';
import { AuthorizeResponseUserType } from '../../core/api/generated/model';
import { devAuthStorage } from '../../features/session/authDev/wrapper';

const isDev = import.meta.env.DEV;

export const PageHeader = () => {
  const _user = useAppSelector(selectUser);

  const user = {
    id: `${_user?.first_name}-${_user?.last_name}`,
    name: `${_user?.first_name} ${_user?.last_name}`,
    productRole: _user?.user_type === 'operator' ? 'Operatore' : 'Admin',
    parentName: _user?.operator_name,
  };
  const switchDevPartyContext = useDevRoleSwitcher(partyRoleMap);

  const getSelectedPartyId = (
    userId: string,
    userRole?: AuthorizeResponseUserType,
  ) => {
    if (!isDev) {
      const partyByUserId = partyList.find((party) => party.id === userId);
      if (partyByUserId) {
        return partyByUserId.id;
      }

      const partyByUserRole = partyList.find(
        (party) => partyRoleMap[party.id] === userRole,
      );
      return partyByUserRole?.id;
    }

    const partyByUserId = partyList.find((party) => party.id === userId);
    if (partyByUserId) {
      return partyByUserId.id;
    }

    const partyByUserRole = partyList.find(
      (party) => partyRoleMap[party.id] === userRole,
    );
    if (partyByUserRole) {
      return partyByUserRole.id;
    }

    const savedPartyId = devAuthStorage.getSelectedPartyId();
    if (savedPartyId && partyList.some((party) => party.id === savedPartyId)) {
      return savedPartyId;
    }

    return partyList[0]?.id;
  };

  if (!_user) {
    return <Navigate replace to={APP_ROUTES.AUTHORIZE} />;
  }

  if (isDev) {
    const selectedPartyId = getSelectedPartyId(user.id, _user?.user_type);
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
  }
  return (
    <Box sx={{ '& .MuiContainer-root': { px: { xs: 2, md: 3 } } }}>
      <HeaderProduct productsList={productsList} partyList={[user]} />
    </Box>
  );
};
