import { HeaderAccount } from '@pagopa/mui-italia';
import { Settings, LogoutRounded } from '@mui/icons-material';
import { accountRootLink } from './constants';

export const TopUtilityBar = () => {
  return (
    <HeaderAccount
      enableDropdown
      rootLink={accountRootLink}
      loggedUser={{ id: 'mario-rossi', name: 'Mario', surname: 'Rossi' }}
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
