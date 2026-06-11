import {
  benefitTypeMap,
  discountTypeMap,
} from '../constants/formOptions/types';
import {
  BenefitRequest,
  LocalizedMetadataItemLanguage,
} from '../core/api/generated/model';

export const getBenefitsDetailData = (
  benefit: BenefitRequest | null | undefined,
  activeLanguage: LocalizedMetadataItemLanguage,
) => {
  if (!benefit) {
    return [];
  }

  switch (benefit.type) {
    case 'free':
    case 'priority':
      return [
        {
          label: 'Tipo di opportunità',
          value: benefitTypeMap[activeLanguage][benefit.type],
        },
      ];
    case 'reduced_fixed_price':
      return [
        {
          label: 'Tipo di opportunità',
          value: benefitTypeMap[activeLanguage][benefit.type],
        },
        { label: 'Valore dello sconto', value: String(benefit.value) },
      ];
    case 'discount':
      return [
        {
          label: 'Tipo di opportunità',
          value: benefitTypeMap[activeLanguage][benefit.type],
        },
        {
          label: 'Modalità di sconto',
          value: discountTypeMap[activeLanguage][benefit.discountType],
        },
        { label: 'Valore dello sconto', value: String(benefit.value) },
      ];
    case 'other':
      return [
        {
          label: 'Tipo di opportunità',
          value: benefitTypeMap[activeLanguage][benefit.type],
        },
        { label: 'Descrizione dello sconto', value: benefit.description },
      ];
    default:
      return [];
  }
};
