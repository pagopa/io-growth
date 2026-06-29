import { Box, CircularProgress, useTheme } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';

type Props = {
  title: string;
  description?: string;
  fullscreen?: boolean;
};

export const SpinnerLoader = ({ title, description, fullscreen }: Props) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        minHeight: '100dvh',
        bgcolor: theme.palette.common.neutralGray,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        position: fullscreen ? 'fixed' : 'relative',
        inset: fullscreen ? 0 : 'auto',
        zIndex: fullscreen ? 1300 : 'auto',
      }}
    >
      <CircularProgress size={64} sx={{ color: theme.palette.primary.main }} />
      <Body fontWeight="Semibold" fontSize="20px">
        {title}
      </Body>
      {description && <Body fontWeight="Regular">{description}</Body>}
    </Box>
  );
};
