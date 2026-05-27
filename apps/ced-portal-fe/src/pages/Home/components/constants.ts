import { ChipColors } from '@pagopa/mui-italia';
import type { OpportunityStatus } from '../../../features/benefits/types';
import { PublicationStatus } from '../../../features/benefitsFilters/types';

export const opportunityStatusLabelMap: Record<
  OpportunityStatus,
  { text: string; color: ChipColors }
> = {
  draft: { text: 'Bozza', color: 'default' },
  test_pending: { text: 'In test', color: 'primary' },
  test_rejected: { text: 'Test rifiutato', color: 'warning' },
  test_passed: { text: 'Test superato', color: 'success' },
  published: { text: 'Pubblicata', color: 'success' },
  suspended: { text: 'Sospesa', color: 'default' },
  deleted: { text: 'Eliminata', color: 'error' },
};

export const benefitStateLabelMap: Record<
  keyof typeof PublicationStatus,
  { text: string; color: ChipColors }
> = {
  SCHEDULED_PUBLICATION: { text: 'Pubblicazione programmata', color: 'info' },
  PUBLISHED: { text: 'Pubblicata su IO', color: 'success' },
  UNDER_REVIEW: { text: 'In revisione', color: 'primary' },
  DRAFT: { text: 'In bozza', color: 'default' },
  CHANGES_REQUESTED: { text: 'Modifiche richieste', color: 'warning' },
  DELETED: { text: 'Eliminata', color: 'error' },
  SUSPENDED: { text: 'Sospesa', color: 'default' },
};
