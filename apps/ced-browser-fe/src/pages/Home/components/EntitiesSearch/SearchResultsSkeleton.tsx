import { Box, Skeleton } from '@mui/material';
import { LabelCaption, ListSkeleton } from '@pagopa/io-core-ui';

export function SearchResultsSkeleton() {
  return (
    <Box sx={{ mt: 3 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1,
        }}
      >
        <LabelCaption>RISULTATI</LabelCaption>
        <Skeleton variant="circular" width={24} height={24} />
      </Box>
      <ListSkeleton />
    </Box>
  );
}
