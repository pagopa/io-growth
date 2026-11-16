export const ASSISTANCE_CATEGORIES = [
  'technical_issue',
  'program_info',
  'agreement_support',
] as const;

export type AssistanceCategory = (typeof ASSISTANCE_CATEGORIES)[number];

// TODO: set operational manual URL
export const OPERATIONAL_MANUAL_URL = '#';

export interface AssistanceContact {
  label: string;
  email: string;
}

export const TECHNICAL_SUPPORT_CONTACT: AssistanceContact = {
  label: 'PagoPA',
  email: 'io+ced-partner@assistenza.pagopa.it',
};

const DISABILITY_DEPARTMENT_CONTACT: AssistanceContact = {
  label:
    'Il Dipartimento per le politiche in favore delle persone con disabilità',
  email: 'convenzioni.disabilitycard@governo.it',
};

export const ASSISTANCE_CONTACT_BY_CATEGORY: Record<
  AssistanceCategory,
  AssistanceContact
> = {
  technical_issue: TECHNICAL_SUPPORT_CONTACT,
  program_info: DISABILITY_DEPARTMENT_CONTACT,
  agreement_support: DISABILITY_DEPARTMENT_CONTACT,
};

export const ASSISTANCE_MODAL_COPY = {
  category: {
    title: 'Come possiamo aiutarti?',
    subtitle: 'Se hai bisogno di supporto con le opportunità, consulta il ',
    manualLinkLabel: 'manuale operativo',
    cancel: 'Annulla',
    continue: 'Continua',
    selectionError: "Seleziona un'opzione",
  },
  contacts: {
    title: 'Ecco chi puoi contattare',
    subtitle: 'Puoi inviare un’email con il motivo della tua richiesta a:',
    back: 'Indietro',
    confirm: 'Ho capito',
  },
  admin: {
    title: 'Problemi tecnici con il portale?',
    cancel: 'Annulla',
  },
};

export const ASSISTANCE_CATEGORY_OPTIONS: {
  value: AssistanceCategory;
  label: string;
}[] = [
  {
    value: 'technical_issue',
    label: 'Ho un problema tecnico con il portale',
  },
  {
    value: 'program_info',
    label:
      'Ho delle domande su come funziona il programma Carta Europea della Disabilità',
  },
  {
    value: 'agreement_support',
    label: 'Ho bisogno di supporto riguardo alla convenzione stipulata',
  },
];
