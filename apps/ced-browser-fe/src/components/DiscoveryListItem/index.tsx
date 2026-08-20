import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import { Box, ButtonBase, Divider, Stack, useTheme } from '@mui/material';
import { Body } from '@pagopa/io-core-ui';
import type {
  DiscoveryListItemProps,
  OpportunityProps,
  SimpleProps,
} from './types';

export type { DiscoveryListItemProps,  } from './types';

function OpportunityContent({ eyebrow, title, badgeLabel }: OpportunityProps) {
  const theme = useTheme();
  const { badgeBg, badgeText, neutral500, neutral900 } = theme.palette.common;
  return (
    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
        {eyebrow && (
          <Box sx={{ color: neutral500, lineHeight: '20px' }}>
            <Body fontWeight="Regular" fontSize="14px">
              {eyebrow}
            </Body>
          </Box>
        )}
        <Box sx={{ color: neutral900, lineHeight: '28px' }}>
          <Body fontWeight="Semibold">{title}</Body>
        </Box>
      </Stack>

      <Box
        component="span"
        sx={{
          display: 'inline-flex',
          alignSelf: 'flex-start',
          alignItems: 'center',
          borderRadius: '999px',
          px: 1,
          py: 0.6,
          bgcolor: badgeBg,
          color: badgeText,
          fontSize: 12,
          fontWeight: 700,
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
  const { onClick, disabled = false, sx, onDelete } = props;

  const handleIconClick = (event: React.MouseEvent) => {
    if (onDelete) {
      event.stopPropagation();
      onDelete();
    }
  };

  const Icon = onDelete ? CloseRoundedIcon : ChevronRightRoundedIcon;
  return (
    <>
      <ButtonBase
        onClick={onClick}
        disabled={disabled}
        sx={[
          {
            width: '100%',
            textAlign: 'left',
            display: 'block',
            py: 2.25,
            bgcolor: 'background.paper',
            transition: 'background-color 120ms ease',
            '&:hover': {
              bgcolor: 'common.neutralGray',
            },
            '&:focus-visible': {
              outline: 'none',
              boxShadow: (theme) =>
                `inset 0 0 0 2px ${theme.palette.common.primaryButton}`,
              bgcolor: 'background.paper',
            },
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
              pl: 1,
            }}
          >
            <Icon
              sx={{ fontSize: 26, zIndex: 1 }}
              onClick={onDelete ? handleIconClick : undefined}
            />
          </Box>
        </Stack>
      </ButtonBase>
      {props.divider && <Divider aria-hidden />}
    </>
  );
}
