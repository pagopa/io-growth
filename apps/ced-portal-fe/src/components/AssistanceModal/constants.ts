export const ASSISTANCE_TOPICS = [
  'technical_issue',
  'program_info',
  'agreement_support',
] as const;

export type AssistanceTopic = (typeof ASSISTANCE_TOPICS)[number];

// TODO: URL definitivo manuale operativo
export const OPERATIONAL_MANUAL_URL = '#';

export interface AssistanceContact {
  label: string;
  email: string;
}

const PAGOPA_CONTACT: AssistanceContact = {
  label: 'PagoPA',
  email: 'io+ced-partner@assistenza.pagopa.it',
};

const DISABILITY_DEPARTMENT_CONTACT: AssistanceContact = {
  label:
    'Il Dipartimento per le politiche in favore delle persone con disabilità',
  email: 'convenzioni.disabilitycard@governo.it',
};

export const ASSISTANCE_CONTACT_BY_TOPIC: Record<
  AssistanceTopic,
  AssistanceContact
> = {
  technical_issue: PAGOPA_CONTACT,
  program_info: DISABILITY_DEPARTMENT_CONTACT,
  agreement_support: DISABILITY_DEPARTMENT_CONTACT,
};

export const ASSISTANCE_MODAL_COPY = {
  closeAriaLabel: 'Chiudi',
  topic: {
    title: 'Come possiamo aiutarti?',
    subtitle: 'Se hai bisogno di supporto con le opportunità, consulta il ',
    manualLinkLabel: 'manuale operativo',
    manualLinkAriaLabel: 'manuale operativo (si apre in una nuova scheda)',
    cancel: 'Annulla',
    continue: 'Continua',
    selectionError: "Seleziona un'opzione",
  },
  contacts: {
    title: 'Ecco chi puoi contattare',
    subtitle: 'Puoi inviare un’email con il motivo della tua richiesta a:',
    copyAriaLabel: 'Copia indirizzo email',
    copiedToast: 'Copiato!',
    back: 'Indietro',
    confirm: 'Ho capito',
  },
};

export const ASSISTANCE_TOPIC_OPTIONS: {
  value: AssistanceTopic;
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
