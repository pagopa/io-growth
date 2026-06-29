import { HeaderAccount } from '@pagopa/mui-italia';
import { Settings, LogoutRounded } from '@mui/icons-material';
import { accountRootLink } from './constants';
import { useAppSelector } from '../../hooks';
import { selectUser } from '../../core/auth/authSelectors';

export const TopUtilityBar = () => {
  const user = useAppSelector(selectUser);

  return (
    <HeaderAccount
      enableDropdown
      rootLink={accountRootLink}
      loggedUser={{
        id: `${user?.first_name}-${user?.last_name}`,
        name: user?.first_name,
        surname: user?.last_name,
      }}
      onAssistanceClick={() => undefined}
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
  );
};
