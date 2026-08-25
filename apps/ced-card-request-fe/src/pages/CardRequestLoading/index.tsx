import { MobileSpinnerLoader } from '@pagopa/io-core-ui';
import { useGetStatusAndNavigate } from './useGetStatusAndNavigate';

export default function CardRequestLoadingPage() {
  useGetStatusAndNavigate();
  return <MobileSpinnerLoader title="Attendi qualche secondo" fullscreen />;
}
