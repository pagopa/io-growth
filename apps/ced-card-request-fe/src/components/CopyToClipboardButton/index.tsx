import { Box } from '@mui/material';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import { MIButton, MIButtonProps } from '@pagopa/mui-italia';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useToast } from '../../contexts';

type MISolidButtonProps = Exclude<MIButtonProps, { variant: 'text' }>;

export interface CopyToClipboardButtonProps extends Omit<
  MISolidButtonProps,
  'children' | 'onClick' | 'startIcon'
> {
  textToCopy?: string;
  label?: ReactNode;
  iconPosition?: 'start' | 'end';
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
  iconPosition = 'end',
  ...buttonProps
}: CopyToClipboardButtonProps) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const { showToast } = useToast();

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Unable to copy to clipboard', error);
      showToast('Non è stato possibile copiare. Riprova.', 'error');
    }
  };

  return (
    <MIButton
      {...buttonProps}
      aria-disabled={!textToCopy}
      onClick={handleCopy}
      sx={{
        display: 'inline-flex',
        gap: 1,
        px: 2,
        py: 1,
        ...sx,
      }}
    >
      {iconPosition === 'start' && (
        <ContentCopyOutlined fontSize="small" color={iconColor ?? 'inherit'} />
      )}
      <Box component="span">
        {copied ? 'Copiato' : (label ?? 'Copia numero')}
      </Box>
      {iconPosition === 'end' && (
        <ContentCopyOutlined fontSize="small" color={iconColor ?? 'inherit'} />
      )}
    </MIButton>
  );
};
