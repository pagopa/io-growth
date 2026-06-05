import {
  BenefitDiscountDiscountType,
  BenefitRequest,
} from '../../core/api/generated/model';

export const benefitTypeMap: Record<BenefitRequest['type'], string> = {
  discount: 'Sconto',
  free: 'Gratuito',
  other: 'Altro',
  priority: 'Priorità',
  reduced_fixed_price: 'Prezzo fisso agevolato',
};

export const discountTypeMap: Record<BenefitDiscountDiscountType, string> = {
  percentage: 'Percentuale',
  fixed_amount: 'Importo fisso',
};
