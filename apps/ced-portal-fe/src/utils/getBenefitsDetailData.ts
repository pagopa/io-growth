import {
  benefitTypeMap,
  discountTypeMap,
} from '../constants/formOptions/types';
import { BenefitRequest } from '../core/api/generated/model';

export const getBenefitsDetailData = (
  benefit: BenefitRequest | null | undefined,
) => {
  if (!benefit) {
    return null;
  }

  switch (benefit.type) {
    case 'free':
    case 'priority':
      return [
        { label: 'Tipo di opportunità', value: benefitTypeMap[benefit.type] },
      ];
    case 'reduced_fixed_price':
      return [
        { label: 'Tipo di opportunità', value: benefitTypeMap[benefit.type] },
        { label: 'Valore dello sconto', value: String(benefit.value) },
      ];
    case 'discount':
      return [
        { label: 'Tipo di opportunità', value: benefitTypeMap[benefit.type] },
        {
          label: 'Modalità di sconto',
          value: discountTypeMap[benefit.discountType],
        },
        { label: 'Valore dello sconto', value: String(benefit.value) },
      ];
    case 'other':
      return [
        { label: 'Tipo di opportunità', value: benefitTypeMap[benefit.type] },
        { label: 'Descrizione dello sconto', value: benefit.description },
      ];
    default:
      return null;
  }
};
