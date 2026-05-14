import { Box, Typography, useTheme } from '@mui/material';

export function SearchEmptyState() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        mt: '100px',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <svg width="47" height="47" viewBox="0 0 47 47" fill="none">
          <path
            d="M23.3333 46.6667C36.22 46.6667 46.6667 36.22 46.6667 23.3333C46.6667 10.4467 36.22 0 23.3333 0C10.4467 0 0 10.4467 0 23.3333C0 36.22 10.4467 46.6667 23.3333 46.6667Z"
            fill={theme.palette.common.decorativeBlue}
          />
          <circle
            cx="23.3335"
            cy="30.8003"
            r="1.86667"
            fill={theme.palette.common.primaryButton}
          />
          <rect
            x="21.4668"
            y="14"
            width="3.73333"
            height="13.0667"
            rx="1.86667"
            fill={theme.palette.common.primaryButton}
          />
        </svg>

        <Typography
          component="h1"
          sx={{
            mt: '28px',
            mb: 1.5,
            color: theme.palette.common.neutral900,
            fontSize: 26,
            lineHeight: 1.15,
            fontWeight: 700,
          }}
        >
          Qui non c&apos;è nulla!
        </Typography>
        <Typography
          sx={{
            color: theme.palette.common.neutral500,
            fontSize: 17,
            lineHeight: 1.35,
            fontWeight: 400,
            maxWidth: 272,
            mx: 'auto',
          }}
        >
          Prova a cercare una città, una struttura o un ente.
        </Typography>
      </Box>
    </Box>
  );
}
