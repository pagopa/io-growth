import { Box, Divider, useTheme } from '@mui/material';
import { LabelCaption } from '@pagopa/io-core-ui';
import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { DiscoveryListItem } from '../../../../components/DiscoveryListItem';
import { PlaceSearchItem } from '../../../../core/api/generated/model';
import { formatAddress } from '../../../../utils/formatAddress';

function highlightText(text: string, regex: RegExp | null): ReactNode {
  if (!regex) return text;
  // split with a capturing group interleaves plain text (even) and matches (odd)
  return text.split(regex).map((part, i) => {
    if (i % 2 === 0) return part;
    return (
      <Box
        key={i}
        component="mark"
        sx={{ bgcolor: 'common.decorativeCyan', color: 'inherit' }}
      >
        {part}
      </Box>
    );
  });
}

type SearchResultsProps = {
  total: number;
  items: PlaceSearchItem[];
  query: string;
  onItemPress: (accessPointId: string) => void;
};

export function SearchResults({
  total,
  items,
  query,
  onItemPress,
}: SearchResultsProps) {
  const theme = useTheme();
  const highlightRegex = useMemo(() => {
    const queryTrim = query.trim();
    if (!queryTrim) return null;
    return new RegExp(
      `(${queryTrim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi',
    );
  }, [query]);
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
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 24,
            height: 24,
            borderRadius: '100px',
            backgroundColor: theme.palette.common.decorativeBlue,
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
            title={highlightText(item.name, highlightRegex)}
            subtitle={highlightText(
              formatAddress(item.address) || item.url || '',
              highlightRegex,
            )}
            onClick={() => onItemPress(item.id)}
            sx={{ bgcolor: 'white', px: 0 }}
          />
        </Box>
      ))}
    </Box>
  );
}
