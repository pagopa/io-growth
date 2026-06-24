import { PlaceBenefit } from '../core/api/generated/model';

export const formatBadgeLabel = (benefit: PlaceBenefit) => {
  if (benefit.type === 'free') return 'GRATIS';
  if (benefit.type === 'discount' && benefit.value != null) {
    return benefit.discountType === 'fixed_amount'
      ? `-${benefit.value}€`
      : `-${benefit.value}%`;
  }
  if (benefit.type === 'reduced_fixed_price' && benefit.value != null) {
    return `${benefit.value}€`;
  }
  return benefit.type;
};
