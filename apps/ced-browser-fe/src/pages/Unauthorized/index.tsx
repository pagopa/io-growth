import ErrorScreen from '../../components/QueryGuard/ErrorScreen';
import { PageErrorType } from '../../components/QueryGuard/ErrorScreen/types';

const Unauthorized = () => {
  return (
    <ErrorScreen
      errorType={PageErrorType.UNAUTHORIZED}
      firstAction={{
        label: 'Chiudi',
        onClick: () => window.location.replace('iossoapi://cancel'),
      }}
    />
  );
};

export default Unauthorized;
