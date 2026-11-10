import { PriorityHigh } from '@mui/icons-material';
import { Button } from '@mui/material';
import { Body, VSpacer } from '@pagopa/io-core-ui';
import { FlowNotice } from '../../components/FlowNotice';

const Unauthorized = () => (
  <FlowNotice
    icon={PriorityHigh}
    title="È passato troppo tempo"
    description={
      <>
        <Body>
          Non preoccuparti: i dati che hai inserito finora sono stati salvati.
        </Body>
        <VSpacer size={16} />
        <Body>
          Chiudi l&apos;app e accedi di nuovo per riprendere la richiesta da
          dove si era interrotta.
        </Body>
      </>
    }
  >
    <Button
      variant="contained"
      onClick={() => window.location.replace('iossoapi://cancel')}
    >
      Chiudi
    </Button>
  </FlowNotice>
);

export default Unauthorized;
