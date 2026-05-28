import { PublicationStatus } from '../../features/benefitsFilters/types';
import { benefitTypeMap, discountTypeMap } from './types';

const generateOptions = <T extends string>(
  enumObj: Record<T, string>,
): Array<{ value: T; label: string }> =>
  Object.entries<string>(enumObj).map(([key, label]) => ({
    value: key as T,
    label,
  }));

export const statusOptions = generateOptions(PublicationStatus);
export const benefitTypeOptions = generateOptions(benefitTypeMap);
export const fixedPriceBenefitTypeOptions = generateOptions(discountTypeMap);
