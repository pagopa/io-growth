import { Box, useTheme } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';
import { Body, Title, VSpacer } from '@pagopa/io-core-ui';
import type { ReactNode } from 'react';

interface Props {
  icon: SvgIconComponent | string;
  title: string;
  description: ReactNode;
  children: ReactNode;
}

export function NoticeLayout({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        bgcolor: 'common.white',
        px: 2,
      }}
    >
      <Box
        sx={{
          minHeight: '100dvh',
          bgcolor: theme.palette.common.neutralGray,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          py: 4,
          textAlign: 'center',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 272 }}>{children}</Box>
      </Box>
    </Box>
  );
}

export function NoticeIcon({ icon }: { icon: SvgIconComponent | string }) {
  const theme = useTheme();
  const isPictogram = typeof icon === 'string';
  return (
    <Box
      sx={{
        width: isPictogram ? 56 : 48,
        height: isPictogram ? 56 : 48,
        borderRadius: '50%',
        bgcolor: isPictogram
          ? 'transparent'
          : theme.palette.common.decorativeBlue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mx: 'auto',
        mb: 3,
      }}
    >
      {typeof icon === 'string' ? (
        <Box component="img" src={icon} alt="" width={56} height={56} />
      ) : (
        <Box
          component={icon}
          sx={{ color: theme.palette.primary.main, fontSize: 24 }}
        />
      )}
    </Box>
  );
}

export function FlowNotice({ icon, title, description, children }: Props) {
  return (
    <NoticeLayout>
      <NoticeIcon icon={icon} />
      <Title variant="MD" text={title} />
      <VSpacer size={8} />
      {typeof description === 'string' ? (
        <Body>{description}</Body>
      ) : (
        description
      )}
      <VSpacer size={32} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
        }}
      >
        {children}
      </Box>
    </NoticeLayout>
  );
}
