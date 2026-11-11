import CloseIcon from '@mui/icons-material/Close';
import { Box, IconButton, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface AssistanceHeaderProps {
  titleId: string;
  descriptionId: string;
  title: string;
  subtitle: ReactNode;
  onClose: () => void;
}

export function AssistanceHeader({
  titleId,
  descriptionId,
  title,
  subtitle,
  onClose,
}: Readonly<AssistanceHeaderProps>) {
  return (
    <Stack spacing={1}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Typography id={titleId} component="h2" variant="h5" fontWeight={700}>
          {title}
        </Typography>
        <IconButton
          aria-label="Chiudi"
          onClick={onClose}
          size="small"
          sx={{ color: 'common.neutralBlack' }}
        >
          <CloseIcon />
        </IconButton>
      </Box>
      <Typography id={descriptionId} variant="body2" color="text.secondary">
        {subtitle}
      </Typography>
    </Stack>
  );
}
