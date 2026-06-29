import { Box, Divider, Skeleton } from '@mui/material';
import { LabelCaption } from '@pagopa/io-core-ui';

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
      {Array.from({ length: 3 }, (_, i) => (
        <Box key={i}>
          {i > 0 ? <Divider /> : null}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1,
              py: 3,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="rounded"
                width={140}
                height={18}
                sx={{ borderRadius: 99, mb: 0.5 }}
              />
              <Skeleton
                variant="rounded"
                width={200}
                height={17}
                sx={{ borderRadius: 99 }}
              />
            </Box>
            <Skeleton variant="circular" width={24} height={24} />
          </Box>
        </Box>
      ))}
    </Box>
  );
}
