import type { AssistanceTopic } from './utils/assistanceTopic';

// TODO: URL definitivo manuale operativo
export const OPERATIONAL_MANUAL_URL = '#';

export const PAGOPA_ASSISTANCE_EMAIL = 'io+ced-partner@assistenza.pagopa.it';

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
    contactLabel: 'PagoPA',
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
