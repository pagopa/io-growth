import { HeaderAccount } from '@pagopa/mui-italia';
import { Settings, LogoutRounded } from '@mui/icons-material';
import { useState } from 'react';
import { accountRootLink } from './constants';
import { useAppSelector } from '../../hooks';
import { selectUser, selectUserType } from '../../core/auth/authSelectors';
import { AssistanceModal } from '../AssistanceModal';

export const TopUtilityBar = () => {
  const user = useAppSelector(selectUser);
  const role = useAppSelector(selectUserType);
  const isAdmin = role === 'admin' || role === 'test_admin';
  const [isAssistanceOpen, setIsAssistanceOpen] = useState(false);

  return (
    <>
      <HeaderAccount
        enableDropdown
        rootLink={accountRootLink}
        loggedUser={{
          id: `${user?.first_name}-${user?.last_name}`,
          name: user?.first_name,
          surname: user?.last_name,
        }}
        enableAssistanceButton={!isAdmin}
        onAssistanceClick={() => setIsAssistanceOpen(true)}
        onDocumentationClick={() => undefined}
        onLogout={() => undefined}
        userActions={[
          {
            id: 'profile',
            label: 'Profilo',
            onClick: () => {
              console.log('Clicked/Tapped on Profile');
            },
            icon: <Settings fontSize="small" color="inherit" />,
          },
          {
            id: 'logout',
            label: 'Esci',
            onClick: () => {
              console.log('User logged out');
            },
            icon: <LogoutRounded fontSize="small" color="inherit" />,
          },
        ]}
      />
      <AssistanceModal
        open={isAssistanceOpen}
        onClose={() => setIsAssistanceOpen(false)}
      />
    </>
  );
};
