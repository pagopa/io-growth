import type { RadioListOption } from '../../../../components/RadioList';

export const PROVINCES_OPTIONS: RadioListOption[] = [
  { label: 'In Provincia di Trento', value: 'trento' },
  { label: 'In Provincia di Bolzano', value: 'bolzano' },
  { label: 'In Provincia di Aosta', value: 'aosta' },
  { label: "In un'altra provincia", value: 'other' },
];

export const YES_NO_OPTIONS: RadioListOption[] = [
  { label: 'Sì', value: 'yes' },
  { label: 'No', value: 'no' },
];

export const DOCUMENT_TYPE_STEP_COPY = {
  hasDoc: {
    title:
      "Hai un documento che attesta l'invalidità (verbale, sentenza, altro provvedimento giudiziario)?",
    subtitle:
      'Questa informazione ci serve per capire se puoi ottenere la carta senza dover inviare documenti aggiuntivi.',
  },
  province: {
    title: 'Dove ti è stato rilasciato?',
  },
  judgment: {
    title:
      "L'invalidità ti è stata riconosciuta con una sentenza o altro provvedimento giudiziario?",
  },
  inps: {
    title: "Il verbale in tuo possesso è stato rilasciato dall'INPS?",
  },
} as const;
