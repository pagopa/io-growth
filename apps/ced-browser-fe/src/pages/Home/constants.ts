import { DiscoveryListItemProps } from '../../components';
import {
  OpportunitySearchResult,
  OpportunitySearchResultBeneficiaryBenefitDiscountType,
  OpportunitySearchResultBeneficiaryBenefitType,
} from '../../generated/model';

const getImageAsset = (
  entityId: string,
  type: 'avatar' | 'cover',
  extension: 'png' | 'jpg' = 'png',
) => `/assets/${entityId}-${type}.${extension}`;

export interface PartnerCardConfig {
  entityId: string;
  title: string;
  imageUrl: string;
  logoUrl: string;
}

// TODO: Refactor/replace this hardcoded PARTNERS_CARDS_CONFIG once partner data/images are provided by the real source of truth.
export const PARTNERS_CARDS_CONFIG: PartnerCardConfig[] = [
  {
    entityId: '01M4XC5SHD8D999NFYVK6Z0M4C',
    title: 'Comune di Alessandria',
    imageUrl: getImageAsset('comune-di-alessandria', 'cover'),
    logoUrl: getImageAsset('comune-di-alessandria', 'avatar'),
  },
  {
    entityId: '01M4XBPMPD6CQQR6FDAGQYS495',
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
      operatorFiscalCode,
      operatorName,
    }) => ({
      id,
      variant: 'opportunity',
      eyebrow: profileDisplayName,
      title: name,
      operatorFiscalCode,
      operatorName,
      badgeLabel: generateBadgeLabel(
        beneficiaryBenefitValue,
        beneficiaryBenefitDiscountType,
        beneficiaryBenefitType,
      ),
    }),
  );
