import { ArrowBack } from '@mui/icons-material';
import { Box, ButtonBase, useTheme } from '@mui/material';
import { Title } from '@pagopa/io-core-ui';
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
}: Readonly<PageHeaderProps>) {
  const navigate = useNavigate();
  const theme = useTheme();
  return (
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      <ButtonBase
        onClick={onBack ?? (() => navigate(-1))}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          color: theme.palette.common.neutralBlack,
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
