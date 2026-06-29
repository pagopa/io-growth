import { DiscoveryListItemProps } from '../../components';
import {
  OpportunitySearchResult,
  OpportunitySearchResultBeneficiaryBenefitDiscountType,
  OpportunitySearchResultBeneficiaryBenefitType,
} from '../../core/api/generated/model';

const getImageAsset = (
  entityId: string,
  type: 'avatar' | 'cover',
  extension: 'png' | 'jpg' = 'png',
) => `/assets/${entityId}-${type}.${extension}`;

// FIXME: remember to refactor this in september
export const PARTNERS_CARDS_CONFIG = [
  {
    entityId: 'comune-di-alessandria',
    title: 'Comune di Alessandria',
    imageUrl: getImageAsset('comune-di-alessandria', 'cover'),
    logoUrl: getImageAsset('comune-di-alessandria', 'avatar'),
  },
  {
    entityId: 'trenitalia',
    title: 'Trenitalia',
    imageUrl: getImageAsset('trenitalia', 'cover'),
    logoUrl: getImageAsset('trenitalia', 'avatar'),
  },
  {
    entityId: 'uci-cinema',
    title: 'UCI Cinema',
    imageUrl: getImageAsset('uci-cinema', 'cover'),
    logoUrl: getImageAsset('uci-cinema', 'avatar'),
  },
  {
    entityId: 'atm-milano',
    title: 'ATM Milano',
    imageUrl: getImageAsset('atm-milano', 'cover'),
    logoUrl: getImageAsset('atm-milano', 'avatar'),
  },
  {
    entityId: 'coop-italia',
    title: 'Coop Italia',
    imageUrl: getImageAsset('coop-italia', 'cover'),
    logoUrl: getImageAsset('coop-italia', 'avatar'),
  },
];

const generateBadgeLabel = (
  value: number | null,
  benefitDiscountType: OpportunitySearchResultBeneficiaryBenefitDiscountType,
  benefitType: OpportunitySearchResultBeneficiaryBenefitType,
) => {
  if (!value) return benefitType;
  return `-${value}${benefitDiscountType === 'fixed_amount' ? '€' : '%'}`;
};

export const generateDiscoveryItemsConfig: (
  opportunities: OpportunitySearchResult[] | undefined,
) => Array<DiscoveryListItemProps & { id: string }> = (opportunities) =>
  (opportunities || []).map(
    ({
      id,
      name,
      profileDisplayName,
      beneficiaryBenefitValue,
      beneficiaryBenefitType,
      beneficiaryBenefitDiscountType,
    }) => ({
      id,
      variant: 'opportunity',
      eyebrow: profileDisplayName,
      title: name,
      badgeLabel: generateBadgeLabel(
        beneficiaryBenefitValue,
        beneficiaryBenefitDiscountType,
        beneficiaryBenefitType,
      ),
    }),
  );

export const DISCOVERY_ITEMS_CONFIG: Array<
  DiscoveryListItemProps & { id: string }
> = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    variant: 'opportunity',
    eyebrow: 'Trenitalia',
    title: '-30% su tutti i viaggi Regionali, Intercity e Intercity notte',
    badgeLabel: '-30%',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    variant: 'opportunity',
    eyebrow: 'Musei Civici Venezia (MUVE)',
    title: 'Accesso prioritario nei Musei Civici di Venezia (MUVE)',
    badgeLabel: 'GRATIS',
  },
  {
    id: '67c3c0ae-8111-477d-8f65-87d25e865f37',
    variant: 'opportunity',
    eyebrow: 'Alitalia',
    title: '-10% su tutti i voli nazionali',
    badgeLabel: '-10%',
  },
  {
    id: '7d3e5f1a-9b2c-4d8e-a1b2-c3d4e5f6a7b8',
    variant: 'opportunity',
    eyebrow: 'Flixbus',
    title: 'Prezzo agevolato su tutte le tratte',
    badgeLabel: '-30%',
  },
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
    variant: 'opportunity',
    eyebrow: 'GENERIC_ENTITY',
    title: 'GENERIC DISCOUNT TITLE',
    badgeLabel: 'Badge',
  },
];
