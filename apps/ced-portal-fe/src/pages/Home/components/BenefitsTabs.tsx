import { Tab, Tabs, Typography, useTheme } from '@mui/material';
import type { SyntheticEvent } from 'react';

interface BenefitsTabsProps {
  activeTab: number;
  onChange: (_event: SyntheticEvent, newValue: number) => void;
}

export function BenefitsTabs({ activeTab, onChange }: BenefitsTabsProps) {
  const theme = useTheme();

  return (
    <Tabs
      value={activeTab}
      onChange={onChange}
      variant="fullWidth"
      sx={{ width: '100%' }}
    >
      <Tab
        label={
          <Typography
            variant="h6"
            color={
              activeTab === 0
                ? theme.palette.common.primaryButton
                : theme.palette.text.secondary
            }
          >
            In gestione
          </Typography>
        }
        sx={{ maxWidth: 'none' }}
      />
      <Tab
        label={
          <Typography
            variant="h6"
            color={
              activeTab === 1
                ? theme.palette.common.primaryButton
                : theme.palette.text.secondary
            }
          >
            Approvate
          </Typography>
        }
        sx={{ maxWidth: 'none' }}
      />
    </Tabs>
  );
}
