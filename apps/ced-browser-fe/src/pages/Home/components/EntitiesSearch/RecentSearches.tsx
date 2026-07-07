import HistoryIcon from '@mui/icons-material/History';

import { Box, Button, Divider, Stack } from '@mui/material';
import { DiscoveryListItem } from '../../../../components';
import { formatAddress } from '../../../../utils/formatAddress';
import { PlaceSearchItem } from '../../../../core/api/generated/model';
import { useCallback } from 'react';
import { LabelCaption } from '@pagopa/io-core-ui';
import { theme } from '../../../../core/theme';

type RecentSearchesProps = {
  items: PlaceSearchItem[];
  onItemPress: (accessPointId: string) => void;
  onRemoveSearchElement: (accessPointId: string) => void;
  onResetHistory?: () => void;
};
export const RecentSearches = ({
  items,
  onItemPress,
  onRemoveSearchElement,
  onResetHistory,
}: RecentSearchesProps) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <Stack>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box sx={{ flexShrink: 0 }}>
          <LabelCaption>RECENTI</LabelCaption>
        </Box>
        <Button
          variant="text"
          sx={{ color: theme.palette.common.primaryButton, pr: 1 }}
          onClick={onResetHistory}
        >
          Cancella tutto
        </Button>
      </Stack>
      {items.map((item, i) => (
        <Box key={item.id}>
          {i > 0 ? <Divider /> : null}
          <Box display="flex" alignItems="center">
            <HistoryIcon sx={{ color: theme.palette.grey[300] }} />
            <DiscoveryListItem
              variant="simple"
              title={item.name}
              subtitle={formatAddress(item.address) || item.url || ''}
              onClick={() => onItemPress(item.id)}
              sx={{ bgcolor: 'white', px: 0 }}
              deleteAction={() => onRemoveSearchElement(item.id)}
            />
          </Box>
        </Box>
      ))}
    </Stack>
  );
};
