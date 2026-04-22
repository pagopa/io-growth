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
      PaperProps={{ sx: { borderRadius: 3 } }}
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
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            {onBack && (
              <IconButton
                onClick={onBack}
                size="small"
                sx={{ mt: -0.5, ml: -0.5, color: '#0E0F13' }}
              >
                <ArrowBackIcon sx={{ fontSize: 24 }} />
              </IconButton>
            )}
            <Box
              sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}
            >
              <Typography variant="h6" fontWeight={700}>
                {title}
              </Typography>
              {description && (
                <Typography variant="body2" color="text.secondary">
                  {description}
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ mt: -0.5, mr: -0.5, color: '#0E0F13' }}
            >
              <CloseIcon sx={{ fontSize: 24 }} />
            </IconButton>
          </Box>

          {children}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
