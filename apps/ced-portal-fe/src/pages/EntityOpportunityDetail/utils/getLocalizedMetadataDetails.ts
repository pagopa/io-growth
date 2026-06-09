import { LocalizedMetadataItem } from '../../../core/api/generated/model';

export const getLocalizedMetadataDetailsMultipleKeys = (
  localizedMetadata: LocalizedMetadataItem[],
  keys: string[],
) => {
  return keys.map(
    (key) =>
      localizedMetadata.find(
        ({ key: metadataKey, language }) =>
          key === metadataKey && language === 'it',
        {},
      )?.value || '',
  );
};
