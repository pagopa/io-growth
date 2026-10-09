import { useBase64Image } from './useBase64Image';

const LOGOS_BASE_URL = 'https://logos.ced.pagopa.it';
const IMAGES_BASE_URL = 'https://images.ced.pagopa.it';

export const useOperatorLogo = (operatorId?: string) =>
  useBase64Image(
    operatorId
      ? `${LOGOS_BASE_URL}/${encodeURIComponent(operatorId)}`
      : undefined,
  );

export const useOperatorCover = (operatorId?: string) =>
  useBase64Image(
    operatorId
      ? `${IMAGES_BASE_URL}/${encodeURIComponent(operatorId)}`
      : undefined,
  );
