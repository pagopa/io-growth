import { forwardRef, useImperativeHandle } from 'react';
import { Typography, useTheme } from '@mui/material';
import type { StepRef } from '../types';

export const Step4Placeholder = forwardRef<StepRef>(
  function Step4Placeholder(_, ref) {
    const theme = useTheme();

    useImperativeHandle(ref, () => ({
      validate() {
        return true;
      },
    }));

    return (
      <Typography
        variant="h3"
        component="h3"
        sx={{ color: theme.palette.common.neutralBlack }}
      >
        Step 4
      </Typography>
    );
  },
);
