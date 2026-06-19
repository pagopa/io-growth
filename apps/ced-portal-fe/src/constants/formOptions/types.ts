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
    priority: 'Priorità',
    reduced_fixed_price: 'Prezzo fisso agevolato',
    other: 'Altro',
  },
  de: {
    discount: 'Rabatt',
    free: 'Kostenlos',
    priority: 'Priorität',
    reduced_fixed_price: 'Ermäßigter Festpreis',
    other: 'Andere',
  },
  en: {
    discount: 'Discount',
    free: 'Free',
    priority: 'Priority',
    reduced_fixed_price: 'Reduced fixed price',
    other: 'Other',
  },
  fr: {
    discount: 'Remise',
    free: 'Gratuit',
    priority: 'Priorité',
    reduced_fixed_price: 'Prix fixe réduit',
    other: 'Autre',
  },
  sl: {
    discount: 'Popust',
    free: 'Brezplačno',
    priority: 'Prednostna obravnava',
    reduced_fixed_price: 'Znižana fiksna cena',
    other: 'Drugo',
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
