import ErrorScreen, {
  IN_APP_BROWSER_CLOSE_DEEPLINK,
} from '../../components/QueryGuard/ErrorScreen';
import { PageErrorType } from '../../components/QueryGuard/ErrorScreen/types';

const Unauthorized = () => {
  return (
    <ErrorScreen
      errorType={PageErrorType.UNAUTHORIZED}
      firstAction={{
        label: 'Chiudi',
        onClick: () => window.location.replace(IN_APP_BROWSER_CLOSE_DEEPLINK),
      }}
    />
  );
};

export default Unauthorized;
