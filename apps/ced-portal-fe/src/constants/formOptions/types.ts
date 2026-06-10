import {
  BenefitDiscountDiscountType,
  BenefitRequest,
  LocalizedMetadataItemLanguage,
} from '../../core/api/generated/model';

type BenefitTypeMap = Record<BenefitRequest['type'], string>;

type DiscountTypeMap = Record<BenefitDiscountDiscountType, string>;

type LocalizedBenefitTypesMap = Record<
  LocalizedMetadataItemLanguage,
  BenefitTypeMap
>;

type LocalizedDiscountTypeMap = Record<
  LocalizedMetadataItemLanguage,
  DiscountTypeMap
>;

export const benefitTypeMap: LocalizedBenefitTypesMap = {
  it: {
    discount: 'Sconto',
    free: 'Gratuito',
    other: 'Altro',
    priority: 'Priorità',
    reduced_fixed_price: 'Prezzo fisso agevolato',
  },
  de: {
    discount: 'Rabatt',
    free: 'Kostenlos',
    other: 'Andere',
    priority: 'Priorität',
    reduced_fixed_price: 'Ermäßigter Festpreis',
  },
  en: {
    discount: 'Discount',
    free: 'Free',
    other: 'Other',
    priority: 'Priority',
    reduced_fixed_price: 'Reduced fixed price',
  },
  fr: {
    discount: 'Remise',
    free: 'Gratuit',
    other: 'Autre',
    priority: 'Priorité',
    reduced_fixed_price: 'Prix fixe réduit',
  },
  sl: {
    discount: 'Popust',
    free: 'Brezplačno',
    other: 'Drugo',
    priority: 'Prednostna obravnava',
    reduced_fixed_price: 'Znižana fiksna cena',
  },
};

export const discountTypeMap: LocalizedDiscountTypeMap = {
  it: {
    percentage: 'Percentuale',
    fixed_amount: 'Importo fisso',
  },
  de: {
    percentage: 'Prozentsatz',
    fixed_amount: 'Fester Betrag',
  },
  en: {
    percentage: 'Percentage',
    fixed_amount: 'Fixed amount',
  },
  fr: {
    percentage: 'Pourcentage',
    fixed_amount: 'Montant fixe',
  },
  sl: {
    percentage: 'Odstotek',
    fixed_amount: 'Fiksni znesek',
  },
};
