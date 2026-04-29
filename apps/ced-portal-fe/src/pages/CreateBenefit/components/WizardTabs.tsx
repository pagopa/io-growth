import type { SyntheticEvent } from 'react';
import { Tab, Tabs } from '@mui/material';

interface WizardTabsProps {
  tabs: string[];
  currentTab: number;
  onChange: (e: SyntheticEvent, value: number) => void;
}

export function WizardTabs({ tabs, currentTab, onChange }: WizardTabsProps) {
  return (
    <Tabs
      value={currentTab}
      onChange={onChange}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: 600,
          color: 'text.secondary',
        },
        '& .Mui-selected': {
          color: 'common.primaryButton',
        },
        '& .MuiTabs-indicator': {
          backgroundColor: 'common.primaryButton',
        },
      }}
    >
      {tabs.map((tab) => (
        <Tab key={tab} label={tab} />
      ))}
    </Tabs>
  );
}
