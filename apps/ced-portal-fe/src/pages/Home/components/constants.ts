import { ChipColors } from '@pagopa/mui-italia';
import { BenefitStatus } from '../../../features/benefitsFilters/types';

export const benefitStateLabelMap: Record<
  keyof typeof BenefitStatus,
  { text: string; color: ChipColors }
> = {
  SCHEDULED_PUBLICATION: {
    text: 'Pubblicazione programmata',
    color: 'info',
  },
  PUBLISHED: { text: 'Pubblicata su IO', color: 'success' },
  UNDER_REVIEW: { text: 'In revisione', color: 'primary' },
  DRAFT: { text: 'In bozza', color: 'default' },
  CHANGES_REQUESTED: { text: 'Modifiche richieste', color: 'warning' },
};
