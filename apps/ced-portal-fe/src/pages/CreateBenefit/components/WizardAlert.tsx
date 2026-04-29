import ReportIcon from '@mui/icons-material/Report';
import { Alert } from '@mui/material';
import type { PropsWithChildren } from 'react';

export function WizardAlert({ children }: PropsWithChildren) {
  return (
    <Alert
      severity="error"
      icon={
        <ReportIcon sx={{ color: (t) => t.palette.error[850], fontSize: 24 }} />
      }
      sx={{
        bgcolor: 'common.alertErrorBg',
        border: (t) => `1px solid ${t.palette.common.alertErrorBorder}`,
        borderRadius: '8px',
      }}
    >
      {children}
    </Alert>
  );
}
