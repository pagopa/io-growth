import { LocalizedMetadataItem } from '../features/opportunities/types';

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
