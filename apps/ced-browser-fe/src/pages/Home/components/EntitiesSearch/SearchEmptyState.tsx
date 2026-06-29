import { Box } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import { IllusMIError } from '@pagopa/mui-italia';

export function SearchEmptyState() {
  return (
    <Box
      sx={{
        mt: '100px',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <IllusMIError />

        <Title text=" Qui non c'è nulla!" variant="LG" />
        <VSpacer size={8} />

        <Body fontWeight="Regular">
          Prova a cercare una città, una <br /> struttura o un ente.
        </Body>
      </Box>
    </Box>
  );
}
