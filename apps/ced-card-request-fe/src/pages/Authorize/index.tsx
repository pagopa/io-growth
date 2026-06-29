import { MobileSpinnerLoader } from '@pagopa/io-core-ui';
import { useGetSession } from '../../hooks';

const Authorize = () => {
  useGetSession();

  return <MobileSpinnerLoader fullscreen title="Attendi qualche secondo" />;
};

export default Authorize;
