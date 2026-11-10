import { PriorityHigh } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FlowNotice } from '../../components/FlowNotice';

export function UpdatePersonalData({ onResume }: { onResume: () => void }) {
  return (
    <FlowNotice
      icon={PriorityHigh}
      title="Aggiorna i tuoi dati prima di continuare"
      description="Se hai notato un errore o alcuni dati anagrafici sono incompleti, aggiorna il tuo profilo SPID o CIE prima di continuare."
    >
      <Button variant="contained" href="https://www.inps.it/">
        Scopri di più
      </Button>
      <Button variant="text" onClick={onResume}>
        Riprendi la richiesta
      </Button>
    </FlowNotice>
  );
}
