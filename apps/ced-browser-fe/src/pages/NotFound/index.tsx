import ErrorScreen from '../../components/QueryGuard/ErrorScreen';
import { PageErrorType } from '../../components/QueryGuard/ErrorScreen/types';

const PageNotFound = () => {
  return <ErrorScreen errorType={PageErrorType.GENERIC_ERROR} />;
};

export default PageNotFound;
