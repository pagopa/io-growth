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
  /** Message announced to screen readers after a successful copy. */
  a11yMessage?: string;
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

const visuallyHidden = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;

export const CopyToClipboardButton = ({
  textToCopy,
  label,
  a11yMessage = 'Copiato',
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
    <>
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
          <ContentCopyOutlined
            fontSize="small"
            color={iconColor ?? 'inherit'}
          />
        )}
        <Box component="span">
          {copied ? 'Copiato' : (label ?? 'Copia numero')}
        </Box>
        {iconPosition === 'end' && (
          <ContentCopyOutlined
            fontSize="small"
            color={iconColor ?? 'inherit'}
          />
        )}
      </MIButton>
      {/* Invisible text read by VoiceOver after the copy. It sits outside the button because iOS ignores it inside. */}
      <Box
        component="span"
        role="status"
        aria-live="polite"
        sx={visuallyHidden}
      >
        {copied ? a11yMessage : ''}
      </Box>
    </>
  );
};
