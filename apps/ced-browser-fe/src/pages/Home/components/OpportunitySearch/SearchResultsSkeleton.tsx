import { Box, Divider, Skeleton, Typography } from '@mui/material';

export function SearchResultsSkeleton() {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 700,
          color: '#555C70',
          letterSpacing: '0.08em',
          mb: 1,
        }}
      >
        RISULTATI
      </Typography>
      {[0, 1, 2].map((i) => (
        <Box key={i}>
          {i > 0 ? <Divider /> : null}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <Skeleton variant="circular" width={36} height={36} />
            <Box sx={{ flex: 1 }}>
              <Skeleton
                variant="rounded"
                width={120}
                height={13}
                sx={{ borderRadius: 99, mb: 1 }}
              />
              <Skeleton
                variant="rounded"
                width={160}
                height={13}
                sx={{ borderRadius: 99 }}
              />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
  );
}
