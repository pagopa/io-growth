import { Tab, Tabs, Typography, useTheme } from '@mui/material';
import type { SyntheticEvent } from 'react';

interface OpportunitiesTabsProps {
  activeTab: number;
  onChange: (event: SyntheticEvent, newValue: number) => void;
}

const TAB_LABELS = ['Nuove', 'Approvate', 'Non attive'];

export const OpportunitiesTabs = ({
  activeTab,
  onChange,
}: OpportunitiesTabsProps) => {
  const theme = useTheme();

  return (
    <Tabs
      value={activeTab}
      onChange={onChange}
      variant="fullWidth"
      sx={{ width: '100%' }}
    >
      {TAB_LABELS.map((label, index) => (
        <Tab
          key={label}
          label={
            <Typography
              variant="h6"
              color={
                activeTab === index
                  ? theme.palette.common.primaryButton
                  : theme.palette.text.secondary
              }
            >
              {label}
            </Typography>
          }
          sx={{ maxWidth: 'none' }}
        />
      ))}
    </Tabs>
  );
};
