export const MODAL_CONTENT = {
  logo: {
    title: 'Logo dell’ente',
    subtitle: 'Il logo sarà visibile nella pagina del tuo ente sull’app IO.',
    body: 'Carica il tuo logo per aiutare gli utenti a capire chi offre le opportunità e migliorare la riconoscibilità e la fiducia nei tuoi servizi.',
    details: [
      "Usa un'immagine quadrata (rapporto 1:1)",
      'Preferisci uno sfondo bianco o trasparente',
      'Se disponibile, usa la versione compatta del logo (pittogramma)',
    ],
  },
  cover: {
    title: 'Immagine di copertina',
    subtitle:
      'L’immagine di copertina è la foto principale della pagina del tuo ente sull’app IO, visibile nella parte alta dello schermo.',
    body: 'Carica un’immagine di copertina per mettere in risalto la tua pagina e le tue opportunità. Questo aumenta anche le possibilità di comparire tra i risultati di ricerca.',
    details: [
      'Non usare immagini con loghi o testi',
      'Scegli una foto che rappresenti il tuo ente o le sue attività (es. sede, territorio, servizi)',
      "Usa un'immagine di alta qualità",
      'Preferisci un formato orizzontale per una corretta visualizzazione',
    ],
  },
};

export type ContactType = 'EMAIL' | 'TELEPHONE' | 'WEBSITE';

type ContactInputField = 'contact' | 'website';
type ContactInputType = 'text' | 'email' | 'tel' | 'url';

export interface ContactInputConfig {
  field: ContactInputField;
  placeholder: string;
  type: ContactInputType;
}

export const CONTACT_TYPE_OPTIONS: Array<{
  label: string;
  value: ContactType;
}> = [
  {
    label: 'Email',
    value: 'EMAIL',
  },
  {
    label: 'Telefono',
    value: 'TELEPHONE',
  },
  {
    label: 'Sito web',
    value: 'WEBSITE',
  },
];

export const CONTACT_INPUT_BY_TYPE = {
  EMAIL: {
    field: 'contact',
    placeholder: 'Inserisci email',
    type: 'email',
  },
  TELEPHONE: {
    field: 'contact',
    placeholder: 'Inserisci telefono',
    type: 'tel',
  },
  WEBSITE: {
    field: 'website',
    placeholder: 'Inserisci url',
    type: 'url',
  },
} satisfies Record<ContactType, ContactInputConfig>;

export const DEFAULT_CONTACT_INPUT: ContactInputConfig = {
  field: 'contact',
  placeholder: 'Inserisci contatto',
  type: 'text',
};

export const getContactInputConfig = (
  contactType: string,
): ContactInputConfig => {
  switch (contactType) {
    case 'EMAIL':
      return CONTACT_INPUT_BY_TYPE.EMAIL;
    case 'TELEPHONE':
      return CONTACT_INPUT_BY_TYPE.TELEPHONE;
    case 'WEBSITE':
      return CONTACT_INPUT_BY_TYPE.WEBSITE;
    default:
      return DEFAULT_CONTACT_INPUT;
  }
};
