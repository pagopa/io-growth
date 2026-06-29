import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, Divider, Stack, useTheme } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import type {
  DiscoveryListItemProps,
  OpportunityProps,
  SimpleProps,
} from './types';

export type { DiscoveryListItemProps, DiscoveryListItemVariant } from './types';

function OpportunityContent({ eyebrow, title, badgeLabel }: OpportunityProps) {
  const theme = useTheme();
  const { badgeBg, badgeText } = theme.palette.common;
  return (
    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Body fontWeight="Regular" fontSize="14px">
            {eyebrow}
          </Body>
        )}
        <Body fontWeight="Semibold">{title}</Body>
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
          bgcolor: badgeBg,
          color: badgeText,
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

function SimpleContent({ title, subtitle }: SimpleProps) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        <Body fontWeight="Semibold">{title}</Body>

        {subtitle && (
          <Body fontWeight="Regular" fontSize="14px">
            {subtitle}
          </Body>
        )}
      </Stack>
    </Stack>
  );
}

export function DiscoveryListItem(props: DiscoveryListItemProps) {
  const { onClick, disabled = false, sx } = props;

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
      <Stack direction="row" justifyContent="space-between" gap={1} px={3}>
        {props.variant === 'simple' ? (
          <SimpleContent {...props} />
        ) : (
          <OpportunityContent {...props} />
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
