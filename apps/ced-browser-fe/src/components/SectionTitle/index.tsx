import { Box } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import type { ReactNode } from 'react';

export function SectionTitle({
  label,
  action,
}: {
  label: string;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        mx: 3,
        pt: 1,
      }}
    >
      <Body fontSize="14px" fontWeight="Semibold">
        {label.toUpperCase()}
      </Body>
      {action}
    </Box>
  );
}
