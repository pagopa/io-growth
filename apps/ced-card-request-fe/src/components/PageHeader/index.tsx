import { ArrowBack } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title } from '../Typography';

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
}: Readonly<PageHeaderProps>) {
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
          color: '#0E0F13',
          fontSize: 16,
          fontWeight: 600,
          mb: 3,
        }}
      >
        <ArrowBack sx={{ fontSize: 20 }} />
        Indietro
      </ButtonBase>

      {leadingContent && <Box sx={{ mb: 3 }}>{leadingContent}</Box>}

      {title && <Title text={title} variant="MD" />}

      {subtitle && <Box sx={{ mt: title ? 0.5 : 0 }}>{subtitle}</Box>}
    </Box>
  );
}
