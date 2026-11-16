import { Button } from '@mui/material';
import { Body, VSpacer } from '@pagopa/io-core-ui';
import { CopyToClipboardButton } from '../../components';
import { FlowNotice } from '../../components/FlowNotice';
import pendingIcon from '../../components/FlowNotice/pending.svg';
import { selectNumDomus } from '../../features/status/selectors';
import { useAppSelector } from '../../hooks';

export default function RequestPending() {
  const numDomus = useAppSelector(selectNumDomus);
  return (
    <FlowNotice
      icon={pendingIcon}
      title="La tua richiesta è in valutazione"
      description={
        <>
          <Body>
            Riceverai un messaggio su IO con gli aggiornamenti sulla tua
            richiesta.
          </Body>
          <VSpacer size={16} />
          {numDomus ? (
            <>
              <Body>
                Salva il codice identificativo della pratica (Numero Domus) per
                rintracciarla in caso di necessità:
              </Body>
              <VSpacer size={16} />
              <Body>{numDomus}</Body>
            </>
          ) : (
            <Body>
              Il numero identificativo della pratica non è disponibile al
              momento.
            </Body>
          )}
        </>
      }
    >
      {numDomus ? (
        <CopyToClipboardButton
          textToCopy={numDomus}
          label="Copia numero"
          variant="contained"
          iconPosition="start"
        />
      ) : null}
      <Button
        variant="text"
        onClick={() => window.location.replace('iossoapi://cancel')}
      >
        Chiudi
      </Button>
    </FlowNotice>
  );
}
