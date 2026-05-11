import type { ReactNode } from 'react';
import { Box, Divider, Typography, useTheme } from '@mui/material';
import { DiscoveryListItem } from '../../../../components/DiscoveryListItem';
import type { EntitySearchItem } from '../../../../features/entities/types';

function highlightText(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q) return text;
  return text
    .split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'))
    .map((part, i) => {
      if (i % 2 === 0) return part;
      return (
        <Box
          key={i}
          component="mark"
          sx={{ bgcolor: '#AAEEEF', color: 'inherit' }}
        >
          {part}
        </Box>
      );
    });
}

export function SearchResults({
  total,
  items,
  query,
  onItemPress,
}: {
  total: number;
  items: EntitySearchItem[];
  query: string;
  onItemPress: (id: string) => void;
}) {
  const theme = useTheme();
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
            color: theme.palette.common.neutralBlack,
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
            title={highlightText(item.name, query)}
            subtitle={highlightText(item.address, query)}
            onClick={() => onItemPress(item.id)}
            sx={{ bgcolor: 'white', px: 0 }}
          />
        </Box>
      ))}
    </Box>
  );
}
