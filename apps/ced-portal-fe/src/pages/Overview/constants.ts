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
} as const;
