import { LocalizedMetadataItemLanguage } from '../../core/api/generated/model';
import { publicationStatusLabels } from '../../features/benefitsFilters/types';
import { benefitTypeMap, discountTypeMap } from './types';

type LocalizedMap<T extends string> = Record<
  LocalizedMetadataItemLanguage,
  Record<T, string>
>;

export const generateLocalizedOptions = <T extends string>(
  language: LocalizedMetadataItemLanguage,
  enumObj: LocalizedMap<T>,
): Array<{ value: T; label: string }> => {
  const localizedMap = enumObj[language];
  return Object.entries<string>(localizedMap).map(([key, label]) => ({
    value: key as T,
    label,
  }));
};

const generateOptions = <T extends string>(
  enumObj: Record<T, string>,
): Array<{ value: T; label: string }> =>
  Object.entries<string>(enumObj).map(([key, label]) => ({
    value: key as T,
    label,
  }));

export const statusOptions = generateOptions(publicationStatusLabels);

export const getLocalizedOptions = (
  activeLanguage: LocalizedMetadataItemLanguage,
  type: 'benefit' | 'discount',
) => {
  if (type === 'benefit')
    return generateLocalizedOptions(activeLanguage, benefitTypeMap);
  return generateLocalizedOptions(activeLanguage, discountTypeMap);
};
