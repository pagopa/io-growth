import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import {
  Box,
  ButtonBase,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import type {
  DiscoveryListItemProps,
  OpportunityProps,
  SimpleProps,
} from './types.js';

export type {
  DiscoveryListItemProps,
  DiscoveryListItemVariant,
} from './types.js';

function OpportunityContent({
  eyebrow,
  title,
  badgeLabel,
  secondaryColor,
}: OpportunityProps & { secondaryColor: string }) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Typography
            component="p"
            sx={{
              color: secondaryColor,
              fontSize: 14,
              lineHeight: 1.2,
              wordBreak: 'break-word',
            }}
          >
            {eyebrow}
          </Typography>
        )}

        <Typography
          component="p"
          sx={{
            color: 'text.primary',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.15,
            wordBreak: 'break-word',
          }}
        >
          {title}
        </Typography>
      </Stack>

      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          alignItems: 'center',
          borderRadius: '999px',
          px: 1,
          py: 0.75,
          bgcolor: '#DBF9FA',
          color: '#003B3D',
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 1,
        }}
      >
        {badgeLabel}
      </Box>
    </Stack>
  );
}

function SimpleContent({
  title,
  subtitle,
  secondaryColor,
}: SimpleProps & { secondaryColor: string }) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Typography
          component="p"
          sx={{
            color: 'text.primary',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.15,
            wordBreak: 'break-word',
          }}
        >
          {title}
        </Typography>

        <Typography
          component="p"
          sx={{
            color: secondaryColor,
            fontSize: 14,
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {subtitle}
        </Typography>
      </Stack>
    </Stack>
  );
}

export function DiscoveryListItem(props: DiscoveryListItemProps) {
  const { onClick, disabled = false, sx } = props;
  const theme = useTheme();
  const secondaryColor = theme.palette.text.secondary;

  return (
    <ButtonBase
      onClick={onClick}
      disabled={disabled}
      sx={[
        {
          width: '100%',
          textAlign: 'left',
          display: 'block',
          py: 2,
          bgcolor: 'common.neutralGray',
          '&:disabled': {
            opacity: 0.7,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Stack direction="row" justifyContent="space-between" gap={1} px={1.5}>
        {props.variant === 'simple' ? (
          <SimpleContent {...props} secondaryColor={secondaryColor} />
        ) : (
          <OpportunityContent {...props} secondaryColor={secondaryColor} />
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: 24 }} />
        </Box>
      </Stack>
      {props.divider && <Divider sx={{ mt: 3 }} />}
    </ButtonBase>
  );
}
