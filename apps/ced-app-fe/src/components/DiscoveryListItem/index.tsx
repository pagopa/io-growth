import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import { Box, ButtonBase, Stack, Typography, useTheme } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';

export type DiscoveryListItemVariant = 'opportunity' | 'simple';

type DiscoveryListItemBaseProps = {
  title: string;
  onClick?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
};

type DiscoveryListItemOpportunityProps = DiscoveryListItemBaseProps & {
  variant?: 'opportunity';
  eyebrow: string;
  badgeLabel: string;
  subtitle?: never;
};

type DiscoveryListItemSimpleProps = DiscoveryListItemBaseProps & {
  variant: 'simple';
  subtitle: string;
  eyebrow?: never;
  badgeLabel?: never;
};

export type DiscoveryListItemProps =
  | DiscoveryListItemOpportunityProps
  | DiscoveryListItemSimpleProps;

function OpportunityContent({
  eyebrow,
  title,
  badgeLabel,
  secondaryColor,
}: Pick<
  DiscoveryListItemOpportunityProps,
  'eyebrow' | 'title' | 'badgeLabel'
> & {
  secondaryColor: string;
}) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0, flex: 1 }}>
      <Stack spacing={0.5} sx={{ minWidth: 0 }}>
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
          bgcolor: '#CBEFF4',
          color: '#004E59',
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
}: Pick<DiscoveryListItemSimpleProps, 'title' | 'subtitle'> & {
  secondaryColor: string;
}) {
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
          py: { xs: 3, md: 3.5 },
          px: { xs: 2, md: 3 },
          bgcolor: 'common.neutralGray',
          '&:disabled': {
            opacity: 0.7,
          },
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Stack direction="row" justifyContent="space-between" gap={2}>
        {props.variant === 'simple' ? (
          <SimpleContent
            title={props.title}
            subtitle={props.subtitle}
            secondaryColor={secondaryColor}
          />
        ) : (
          <OpportunityContent
            eyebrow={props.eyebrow}
            title={props.title}
            badgeLabel={props.badgeLabel}
            secondaryColor={secondaryColor}
          />
        )}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          <ChevronRightRoundedIcon sx={{ fontSize: { xs: 24, md: 28 } }} />
        </Box>
      </Stack>
    </ButtonBase>
  );
}
