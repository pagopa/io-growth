import type { ReactNode } from 'react';
import type { SxProps, Theme } from '@mui/material';

export type DiscoveryListItemVariant = 'opportunity' | 'simple';

type DiscoveryListItemBaseProps = {
  title: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  sx?: SxProps<Theme>;
  divider?: boolean;
};

type VariantMap = {
  opportunity: {
    eyebrow?: string;
    badgeLabel?: string;
  };
  simple: {
    subtitle?: ReactNode;
  };
};

export type DiscoveryListItemProps = {
  [K in keyof VariantMap]: DiscoveryListItemBaseProps & {
    variant: K;
  } & VariantMap[K];
}[keyof VariantMap];

export type OpportunityProps = Extract<
  DiscoveryListItemProps,
  { variant: 'opportunity' }
>;

export type SimpleProps = Extract<
  DiscoveryListItemProps,
  { variant: 'simple' }
>;
