import { Box } from '@mui/material';
import {
  MIButton,
  MIButtonProps,
  CopyToClipboardButton as MIIconCopyButton,
} from '@pagopa/mui-italia';
import { useState, type ReactNode } from 'react';

type MISolidButtonProps = Exclude<MIButtonProps, { variant: 'text' }>;

export interface CopyToClipboardButtonProps extends Omit<
  MISolidButtonProps,
  'children' | 'onClick' | 'startIcon'
> {
  textToCopy?: string;
  label?: ReactNode;
  iconColor?:
    | 'inherit'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
}

export const CopyToClipboardButton = ({
  textToCopy,
  label,
  sx,
  iconColor,
  ...buttonProps
}: CopyToClipboardButtonProps) => {
  const [copied, setCopied] = useState(false);

  return (
    <MIButton
      {...buttonProps}
      sx={{
        position: 'relative',
        p: 0,
        ...sx,
      }}
    >
      <Box
        component="span"
        onClick={() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 2000);
        }}
        sx={{ position: 'absolute', inset: 0 }}
      >
        <MIIconCopyButton
          value={textToCopy ?? ''}
          sx={{
            width: '100%',
            height: '100%',
            m: 0,
            borderRadius: 'inherit',
            color: iconColor ?? 'inherit',
            justifyContent: 'flex-end',
            pr: 2,
          }}
        />
      </Box>
      <Box component="span" sx={{ pointerEvents: 'none', pl: 2, pr: 6, py: 1 }}>
        {copied ? 'Copiato' : (label ?? 'Copia numero')}
      </Box>
    </MIButton>
  );
};
