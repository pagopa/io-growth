import AddIcon from '@mui/icons-material/Add';
import LanguageIcon from '@mui/icons-material/Language';
import { Box, Button, Typography } from '@mui/material';
import { SectionCard } from '../../../../components';
import { useGetWebsitesQuery } from '../../../../features/website/api';
import {
  selectAccessPoint,
  selectSelectedWebsiteIds,
} from '../../../../features/wizard/slice';
import { useAppSelector } from '../../../../hooks/store';
import { useWebsiteSelectionFlow } from '../hooks/useWebsiteSelectionFlow';
import { AddWebsiteModal } from './AddWebsiteModal';
import { SelectWebsiteModal } from './SelectWebsiteModal';
import { WebsiteList } from './WebsiteList';

export function WebsiteManagementSection() {
  const accessPoint = useAppSelector(selectAccessPoint);
  const showWebsiteSection = accessPoint === 'online';

  const selectedWebsiteIds = useAppSelector(selectSelectedWebsiteIds);
  const { data: availableWebsites = [] } = useGetWebsitesQuery(undefined, {
    skip: !showWebsiteSection,
  });
  const selectedWebsites = availableWebsites.filter((w) =>
    selectedWebsiteIds.includes(w.id),
  );

  const {
    modal,
    pendingSelection,
    setPendingSelection,
    handleAddClick,
    handleAddConfirm,
    handleSelectConfirm,
    handleSelectClose,
    handleAddNew,
    handleBack,
    handleAddClose,
    handleRemove,
  } = useWebsiteSelectionFlow();

  if (!showWebsiteSection) return null;

  return (
    <>
      <SectionCard sx={{ gap: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <LanguageIcon sx={{ color: 'text.disabled', fontSize: 24 }} />
          <Typography
            variant="body2"
            sx={{ color: 'common.neutralBlack' }}
            fontWeight={600}
          >
            Siti web
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleAddClick(availableWebsites.length > 0)}
          sx={{ textTransform: 'none', alignSelf: 'flex-start' }}
        >
          Aggiungi siti web
        </Button>

        <WebsiteList websites={selectedWebsites} onRemove={handleRemove} />
      </SectionCard>

      {modal === 'select' && (
        <SelectWebsiteModal
          open
          websites={availableWebsites}
          selected={pendingSelection}
          onSelectedChange={setPendingSelection}
          onClose={handleSelectClose}
          onAddNew={handleAddNew}
          onConfirm={handleSelectConfirm}
        />
      )}

      {(modal === 'add' || modal === 'add-from-select') && (
        <AddWebsiteModal
          open
          onClose={handleAddClose}
          onConfirm={handleAddConfirm}
          onBack={modal === 'add-from-select' ? handleBack : undefined}
        />
      )}
    </>
  );
}
