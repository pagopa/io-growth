import { Check, PriorityHigh } from '@mui/icons-material';
import {
  OPEN_REQUEST_HELP_URL,
  PERSONAL_DATA_HELP_URL,
  PHOTO_HELP_URL,
} from '../../externalLinks';
import pendingIcon from '../../components/FlowNotice/pending.svg';
import maintenanceIcon from '../../components/FlowNotice/maintenance.svg';
import type { GenericErrorConfig } from './index';

// TODO must insert the real link to the content of the error code
export const GENERIC_ERROR_CONFIG: Record<number, GenericErrorConfig> = {
  // #region Errors by /status
  107: {
    errorCode: 107,
    title: 'Non puoi procedere con la richiesta',
    description: 'La persona indicata non risulta più in vita.',
    icon: PriorityHigh,
    cAcLink: 'https://www.inps.it/',
    showMoreInfo: false,
  },
  212: {
    errorCode: 212,
    title: "La tua residenza è all'estero",
    description: "Non puoi richiedere la Carta se risiedi all'estero.",
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
    additionalDescription:
      "Se hai cambiato residenza, aggiorna l'indirizzo sul portale MyINPS. In caso di problemi, contatta l'INPS.",
  },
  213: {
    errorCode: 213,
    title: 'La tua residenza non è presente nei sistemi',
    description:
      "Inserisci un indirizzo valido sul portale MyINPS per continuare. In caso di problemi, contatta l'INPS.",
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  214: {
    errorCode: 214,
    title: "L'ente ha riscontrato dei problemi con la tua residenza",
    description:
      "Inserisci un indirizzo valido sul portale MyINPS per continuare. In caso di problemi, contatta l'INPS.",
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  500: {
    errorCode: 500,
    title: "L'ente sta riscontrando dei problemi",
    description:
      'I servizi dell’INPS sono temporaneamente fuori servizio. Se il problema persiste, riprova più tardi.',
    icon: PriorityHigh,
    cAcLink: 'https://www.inps.it/',
    closeLabel: 'Chiudi',
    showMoreInfo: false,
  },
  700: {
    errorCode: 700,
    title: 'Hai già la Carta Europea della Disabilità',
    description:
      'Se non l’hai ancora fatto, puoi aggiungere la versione digitale della tua Carta Europea della Disabilità al Portafoglio di IO.',
    icon: Check,
    cAcLink: 'https://www.inps.it/',
    showErrorCode: false,
    showMoreInfo: false,
  },
  701: {
    errorCode: 701,
    title: 'La tua richiesta è in valutazione',
    description:
      'Riceverai aggiornamenti dall’INPS sull’esito della tua richiesta.',
    icon: pendingIcon,
    cAcLink: 'https://www.inps.it/',
    showErrorCode: false,
    showMoreInfo: false,
    showSecondaryClose: true,
  },
  702: {
    errorCode: 702,
    title: 'Hai già una richiesta aperta su MyINPS',
    description:
      'Vai sul sito dell’INPS per completare la richiesta della carta.',
    icon: maintenanceIcon,
    cAcLink: OPEN_REQUEST_HELP_URL,
    showErrorCode: false,
    moreInfoLabel: 'Leggi come fare',
  },
  // #endregion Errors by /status

  // #region Errors by /request
  200: {
    errorCode: 200,
    title: 'Il tuo nome non corrisponde',
    description:
      'Verifica che le informazioni presenti sul portale dell’Anagrafe Nazionale e sul tuo profilo INPS siano aggiornate e corrispondano.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  201: {
    errorCode: 201,
    title: 'Il tuo cognome non corrisponde',
    description:
      'Verifica che le informazioni presenti sul portale dell’Anagrafe Nazionale e sul tuo profilo INPS siano aggiornate e corrispondano.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  203: {
    errorCode: 203,
    title: 'Il tuo sesso non corrisponde',
    description:
      'Verifica che le informazioni presenti sul portale dell’Anagrafe Nazionale e sul tuo profilo INPS siano aggiornate e corrispondano.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  204: {
    errorCode: 204,
    title: 'La tua data di nascita non corrisponde',
    description:
      'Verifica che le informazioni presenti sul portale dell’Anagrafe Nazionale e sul tuo profilo INPS siano aggiornate e corrispondano.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  205: {
    errorCode: 205,
    title: 'Il tuo Stato di nascita non corrisponde',
    description:
      'Verifica che le informazioni presenti sul portale dell’Anagrafe Nazionale e sul tuo profilo INPS siano aggiornate e corrispondano.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  206: {
    errorCode: 206,
    title: 'Il tuo comune di nascita non corrisponde',
    description:
      'Verifica che le informazioni presenti sul portale dell’Anagrafe Nazionale e sul tuo profilo INPS siano aggiornate e corrispondano.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  207: {
    errorCode: 207,
    title: 'La tua provincia di nascita non corrisponde',
    description:
      'Verifica che le informazioni presenti sul portale dell’Anagrafe Nazionale e sul tuo profilo INPS siano aggiornate e corrispondano.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  209: {
    errorCode: 209,
    title: 'Il tuo permesso di soggiorno è in scadenza',
    description:
      'Rinnova il permesso di soggiorno prima di procedere con la richiesta della Carta.',
    icon: PriorityHigh,
    cAcLink: PERSONAL_DATA_HELP_URL,
  },
  // #endregion Errors by /request

  // #region Errors by /photo
  904: {
    errorCode: 904,
    title: 'La foto non è adatta per la stampa',
    description:
      'Prova con una foto diversa. Se il problema persiste, scattane una nuova con la fotocamera.',
    multiDescription:
      'La foto non è adatta per la stampa. Prova con una foto diversa.',
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  905: {
    errorCode: 905,
    title: 'La foto non è adatta per la stampa',
    description:
      'Prova con una foto diversa. Se il problema persiste, scattane una nuova con la fotocamera.',
    multiDescription:
      'La foto non è adatta per la stampa. Prova con una foto diversa.',
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  906: {
    errorCode: 906,
    title: 'Non riusciamo a verificare la tua foto',
    description:
      'Prova con una foto diversa. Se il problema persiste, scattane una nuova con la fotocamera.',
    multiDescription:
      'Non riusciamo a verificare la tua foto. Prova con una foto diversa.',
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  907: {
    errorCode: 907,
    title: 'Viso troppo vicino',
    description: 'Tieni il telefono più lontano dal viso e riprova.',
    multiDescription:
      "L'inquadratura del tuo viso è un po' troppo ravvicinata. Tieni il telefono più lontano e riprova.",
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  908: {
    errorCode: 908,
    title: 'La foto è sfocata',
    description:
      "Pulisci l'obiettivo e appoggia il telefono su una superficie stabile, poi riprova.",
    multiDescription:
      "Pulisci l'obiettivo e appoggia il telefono su una superficie stabile prima di scattare la foto.",
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  909: {
    errorCode: 909,
    title: 'La foto è sfocata',
    description:
      "Pulisci l'obiettivo e appoggia il telefono su una superficie stabile, poi riprova.",
    multiDescription:
      "Pulisci l'obiettivo e appoggia il telefono su una superficie stabile prima di scattare la foto.",
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  910: {
    errorCode: 910,
    title: 'La foto è troppo scura',
    description:
      'Accendi la luce o posizionati vicino a una finestra, poi riprova.',
    multiDescription:
      'Accendi la luce o spostati vicino a una finestra per illuminare bene il viso mentre scatti la foto.',
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  911: {
    errorCode: 911,
    title: 'Volto non riconoscibile',
    description:
      "Inquadra bene il tuo viso e assicurati di essere l'unica persona in foto.",
    multiDescription:
      "Inquadra bene il tuo viso e assicurati di essere l'unica persona in foto.",
    icon: PriorityHigh,
    cAcLink: PHOTO_HELP_URL,
  },
  // #endregion Errors by /photo
};
