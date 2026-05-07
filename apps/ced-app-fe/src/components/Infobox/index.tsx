import { Paper, Typography, Button, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { IllusAlarmClock } from '@pagopa/mui-italia';

interface InfoBoxProps {
  title: string;
  description: string;
  linkText: string;
  icon?: string;
  onLinkClick?: () => void;
}

export const InfoBox = ({
  title,
  description,
  linkText,
  icon,
  onLinkClick,
}: InfoBoxProps) => {
  const theme = useTheme();
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        borderRadius: 2,
        position: 'relative',
        overflow: 'hidden',
        borderColor: 'grey.200',
        backgroundColor: 'background.paper',
        maxWidth: 500,
      }}
    >
      <Stack direction="row" spacing={2.5}>
        {/* Barra di accento verticale */}
        <Box
          sx={{
            width: 4,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 4,
          }}
        />

        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            {/* Header: Titolo e Illustrazione */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.3,
                  color: 'text.primary',
                  pr: 2, // Spazio per l'immagine
                }}
              >
                {title}
              </Typography>

              {/* Illustrazione circolare */}
              <IllusAlarmClock></IllusAlarmClock>
              {/* <Box
                component="img"
                src={imageUrl}
                alt=""
                sx={{
                  width: 80,
                  height: 80,
                  objectFit: 'contain',
                  mt: -1,
                }}
              /> */}
            </Stack>

            {/* Descrizione */}
            <Typography
              variant="body2"
              sx={{
                color: 'text.secondary',
                lineHeight: 1.6,
                fontSize: '1rem',
              }}
            >
              {description}
            </Typography>

            {/* Action Link */}
            <Box>
              <Button
                variant="text"
                onClick={onLinkClick}
                sx={{
                  p: 0,
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '1rem',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline',
                  },
                }}
              >
                {linkText}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
