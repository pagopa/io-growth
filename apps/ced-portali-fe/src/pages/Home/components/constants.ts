import { ChipColors } from '@pagopa/mui-italia';

export const benefitStateLabelMap: Record<
  string,
  { text: string; color: ChipColors }
> = {
  Pubblicazione_Programmata: {
    text: 'Pubblicazione programmata',
    color: 'info',
  },
  Pubblicata: { text: 'Pubblicata su IO', color: 'success' },
  Revisione: { text: 'In revisione', color: 'primary' },
  Bozza: { text: 'In bozza', color: 'default' },
  Modifiche_Richieste: { text: 'Modifiche richieste', color: 'warning' },
};
