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
          Gli ultimi dati inseriti potrebbero non essere stati salvati.
        </Body>
        <VSpacer size={16} />
        <Body>
          Chiudi l’app e accedi di nuovo per continuare la richiesta. Se avevi
          una bozza salvata, potrai recuperarla.
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
