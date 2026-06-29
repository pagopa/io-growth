import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { IllusMIIdea } from '@pagopa/mui-italia';

export function SearchInitialState() {
  return (
    <Box
      sx={{
        mt: '100px',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <IllusMIIdea />
        <Title text="Inizia a cercare" variant="LG" />
        <VSpacer size={8} />

        <Body fontWeight="Regular">
          Prova a cercare una città, una <br /> struttura o un ente.
        </Body>
      </Box>
    </Box>
  );
}
