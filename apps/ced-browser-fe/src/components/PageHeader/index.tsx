import { ArrowBack } from '@mui/icons-material';
import { Box, ButtonBase } from '@mui/material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import type { MouseEvent, ReactNode } from 'react';
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

  const handleBackClick = (event: MouseEvent<HTMLButtonElement>) => {
    (onBack ?? (() => navigate(-1)))();
    event.currentTarget.blur();
  };

  return (
    <Box sx={{ px: 3, pt: 3, pb: 2 }}>
      <ButtonBase
        onClick={handleBackClick}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          color: 'text.primary',
          fontSize: 16,
          fontWeight: 600,
          mb: 3,
          WebkitTapHighlightColor: 'transparent',
          '&:focus': {
            outline: 'none',
          },
          '&:focus-visible': {
            outline: 'auto',
          },
          '@media (hover: none) and (pointer: coarse)': {
            '&:focus-visible': {
              outline: 'none',
            },
          },
        }}
      >
        <ArrowBack sx={{ fontSize: 20 }} />
        Indietro
      </ButtonBase>

      {leadingContent && <Box>{leadingContent}</Box>}

      {title && <Title variant="LG" text={title} fontWeight="700" />}

      {subtitle && (
        <>
          <VSpacer size={8} />
          <Body fontWeight="Regular" fontSize="16px">
            {subtitle}
          </Body>
        </>
      )}
    </Box>
  );
}
