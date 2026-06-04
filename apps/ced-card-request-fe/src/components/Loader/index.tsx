import { Box, CircularProgress, useTheme } from '@mui/material';
import { Body } from '../Typography';

type Props = {
  title: string;
  description?: string;
};

export const SpinnerLoader = ({ title, description }: Props) => {
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
