import { Box, Divider, Typography } from '@mui/material';
import { DiscoveryListItem } from '../../../../components/DiscoveryListItem';
import type { EntitySearchItem } from '../../../../features/entities/types';

export function SearchResults({
  total,
  items,
  onItemPress,
}: {
  total: number;
  items: EntitySearchItem[];
  onItemPress: (id: string) => void;
}) {
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
        <Typography
          sx={{
            fontSize: 12,
            fontWeight: 700,
            color: '#555C70',
            letterSpacing: '0.08em',
          }}
        >
          RISULTATI
        </Typography>
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '100px',
            backgroundColor: '#E7ECFC',
            border: 'none',
            fontSize: 12,
            fontWeight: 600,
            color: '#555C70',
            lineHeight: 1,
          }}
        >
          {total}
        </Box>
      </Box>
      {items.map((item, i) => (
        <Box key={item.id}>
          {i > 0 ? <Divider /> : null}
          <DiscoveryListItem
            variant="simple"
            title={item.name}
            subtitle={item.address}
            onClick={() => onItemPress(item.id)}
            sx={{ bgcolor: 'white', px: 0 }}
          />
        </Box>
      ))}
    </Box>
  );
}
