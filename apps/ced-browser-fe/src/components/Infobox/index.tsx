import { Box, Paper, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Body, Title } from '@pagopa/io-core-ui';
import { IllusMIEarth } from '@pagopa/mui-italia';

interface InfoBoxProps {
  title: string;
  description: string;
  linkText: string;
  onLinkClick?: () => void;
}

export const InfoBox = ({
  title,
  description,
  linkText,
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
        padding: '16px',
      }}
    >
      <Stack direction="row" spacing={2.5}>
        <Box
          sx={{
            width: 4,
            backgroundColor: theme.palette.common.primaryButton,
            borderRadius: 4,
          }}
        />

        <Box sx={{ flex: 1 }}>
          <Stack spacing={2}>
            <Stack direction="row" alignItems="flex-start">
              <Box sx={{ flex: '0 0 70%' }}>
                <Title text={title} variant="XS" />
              </Box>
              <Box
                sx={{
                  flex: '0 0 30%',
                  display: 'flex',
                  justifyContent: 'flex-end',
                }}
              >
                <IllusMIEarth size={56} />
              </Box>
            </Stack>
            <Body fontWeight="Regular">{description}</Body>

            {onLinkClick && (
              <Body
                avoidTextDecoration
                onClick={onLinkClick}
                asLink
                fontWeight="Semibold"
              >
                {linkText}
              </Body>
            )}
          </Stack>
        </Box>
      </Stack>
    </Paper>
  );
};
