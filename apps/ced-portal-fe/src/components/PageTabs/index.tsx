import { Tab, Tabs, Typography, useTheme } from '@mui/material';
import type { SyntheticEvent } from 'react';

interface PageTabsProps {
  activeTab: number;
  onChange: (event: SyntheticEvent, newValue: number) => void;
  tabLabels?: string[];
}

const DEFAULT_TAB_LABELS = ['Nuove', 'Approvate', 'Non attive'];

export const PageTabs = ({
  activeTab,
  onChange,
  tabLabels = DEFAULT_TAB_LABELS,
}: PageTabsProps) => {
  const theme = useTheme();

  return (
    <Tabs
      value={activeTab}
      onChange={onChange}
      variant="fullWidth"
      sx={{ width: '100%' }}
    >
      {tabLabels.map((label, index) => (
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
