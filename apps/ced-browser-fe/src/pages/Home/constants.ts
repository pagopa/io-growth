import { DiscoveryListItemProps } from '../../components';

/// mock
export const PARTNERS_CARDS_CONFIG = [
  {
    title: 'Comune di Alessandria',
    imageUrl: 'https://picsum.photos/id/1018/600/400',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Alessandria-Stemma.png', // Placeholder stemma
    onClick: () => console.log('Card cliccata'),
  },
  {
    title: 'Comune di Cagliari',
    imageUrl: 'https://picsum.photos/id/1018/600/400',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Alessandria-Stemma.png', // Placeholder stemma
    onClick: () => console.log('Card cliccata'),
  },
  {
    title: 'Comune di Agrigento',
    imageUrl: 'https://picsum.photos/id/1018/600/400',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Alessandria-Stemma.png', // Placeholder stemma
    onClick: () => console.log('Card cliccata'),
  },
  {
    title: 'Comune di Milano',
    imageUrl: 'https://picsum.photos/id/1018/600/400',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Alessandria-Stemma.png', // Placeholder stemma
    onClick: () => console.log('Card cliccata'),
  },
  {
    title: 'Trenitalia',
    imageUrl: 'https://picsum.photos/id/1018/600/400',
    logoUrl:
      'https://upload.wikimedia.org/wikipedia/commons/d/d5/Alessandria-Stemma.png', // Placeholder stemma
    onClick: () => console.log('Card cliccata'),
  },
];

export const DISCOVERY_ITEMS_CONFIG: Array<
  DiscoveryListItemProps & { id: string }
> = [
  {
    id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    variant: 'opportunity',
    eyebrow: 'Trenitalia',
    title: '-30% su tutti i viaggi Regionali, Intercity e Intercity notte',
    badgeLabel: '-30%',
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    variant: 'opportunity',
    eyebrow: 'Musei Civici Venezia (MUVE)',
    title: 'Accesso prioritario nei Musei Civici di Venezia (MUVE)',
    badgeLabel: 'GRATIS',
  },
  {
    id: '67c3c0ae-8111-477d-8f65-87d25e865f37',
    variant: 'opportunity',
    eyebrow: 'Alitalia',
    title: '-10% su tutti i voli nazionali',
    badgeLabel: '-10%',
  },
  {
    id: '7d3e5f1a-9b2c-4d8e-a1b2-c3d4e5f6a7b8',
    variant: 'opportunity',
    eyebrow: 'Flixbus',
    title: 'Prezzo agevolato su tutte le tratte',
    badgeLabel: '-30%',
  },
  {
    id: '1a2b3c4d-5e6f-7a8b-9c0d-e1f2a3b4c5d6',
    variant: 'opportunity',
    eyebrow: 'GENERIC_ENTITY',
    title: 'GENERIC DISCOUNT TITLE',
    badgeLabel: 'Badge',
  },
];
