import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  type DialogProps,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

export interface AppModalProps {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  maxWidth?: DialogProps['maxWidth'];
}

export function AppModal({
  open,
  onClose,
  onBack,
  title,
  description,
  children,
  maxWidth = 'sm',
}: AppModalProps) {
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason !== 'backdropClick') {
          onClose();
        }
      }}
      fullWidth
      maxWidth={maxWidth}
    >
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            p: { xs: '16px', sm: '24px' },
            flex: 1,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {onBack && (
                <IconButton
                  onClick={onBack}
                  size="small"
                  sx={{ mt: -0.5, color: 'common.neutralBlack' }}
                >
                  <ArrowBackIcon sx={{ fontSize: 24 }} />
                </IconButton>
              )}
              <Typography variant="h6" fontWeight={700} sx={{ flex: 1 }}>
                {title}
              </Typography>
              <IconButton
                onClick={onClose}
                size="small"
                sx={{ mt: -0.5, mr: -0.5, color: 'common.neutralBlack' }}
              >
                <CloseIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
            {description && (
              <Typography variant="body2" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>

          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
