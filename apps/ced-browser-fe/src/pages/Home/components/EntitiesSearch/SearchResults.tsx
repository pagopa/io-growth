import { Box, Divider, useTheme } from '@mui/material';
import { LabelCaption, VSpacer, WarningBanner } from '@pagopa/io-core-ui';
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
        key={`${part}-${i}`}
        component="mark"
        sx={{ bgcolor: 'common.decorativeCyan', color: 'inherit' }}
      >
        {part}
      </Box>
    );
  });
}

type SearchResultsProps = {
  query: string;
  onItemPress: (accessPointId: string) => void;
  isError: boolean;
  onRetry: () => void;
  total?: number;
  items?: PlaceSearchItem[];
};

export function SearchResults({
  total,
  items,
  query,
  onItemPress,
  isError,
  onRetry,
}: Readonly<SearchResultsProps>) {
  const theme = useTheme();
  const highlightRegex = useMemo(() => {
    const queryTrim = query.trim();
    if (!queryTrim) return null;
    const escapedQuery = queryTrim.replace(
      /[.*+?^${}()|[\]\\]/g,
      String.raw`\\$&`,
    );
    return new RegExp(String.raw`(${escapedQuery})`, 'gi');
  }, [query]);

  const renderContent = () => {
    if (isError) {
      return (
        <>
          <VSpacer size={16} />
          <WarningBanner
            title="C’è stato un problema nel caricamento dei risultati."
            action={
              onRetry
                ? {
                    label: 'Ricarica',
                    onClick: onRetry,
                  }
                : undefined
            }
          />
        </>
      );
    }
    return items?.map((item, i) => (
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
    ));
  };

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
          {total ?? 0}
        </Box>
      </Box>
      {renderContent()}
    </Box>
  );
}
