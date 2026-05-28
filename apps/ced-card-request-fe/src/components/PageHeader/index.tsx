import { ArrowBack } from '@mui/icons-material';
import { Box, ButtonBase, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type PageHeaderProps = {
  title?: string;
  subtitle?: ReactNode;
  leadingContent?: ReactNode;
  onBack?: () => void;
};

export function PageHeader({
  title,
  subtitle,
  leadingContent,
  onBack,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      <ButtonBase
        onClick={onBack ?? (() => navigate(-1))}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          color: 'text.primary',
          fontSize: 16,
          fontWeight: 600,
          mb: 3,
        }}
      >
        <ArrowBack sx={{ fontSize: 20 }} />
        Indietro
      </ButtonBase>

      {leadingContent && <Box sx={{ mb: 3 }}>{leadingContent}</Box>}

      {title && (
        <Typography
          variant="h1"
          component="h1"
          sx={{
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
      )}

      {subtitle && <Box sx={{ mt: title ? 0.5 : 0 }}>{subtitle}</Box>}
    </Box>
  );
}
