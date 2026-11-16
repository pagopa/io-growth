import { Check } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FlowNotice } from '../../components/FlowNotice';

export function DraftChoice({
  onResume,
  onNew,
}: {
  onResume: () => void;
  onNew: () => void;
}) {
  return (
    <FlowNotice
      icon={Check}
      title="Vuoi continuare la richiesta già iniziata?"
      description="Continua per riprendere da dove hai lasciato, oppure inizia una nuova richiesta."
    >
      <Button variant="contained" onClick={onResume}>
        Sì, continua richiesta
      </Button>
      <Button variant="text" onClick={onNew}>
        No, inizia nuova richiesta
      </Button>
    </FlowNotice>
  );
}
