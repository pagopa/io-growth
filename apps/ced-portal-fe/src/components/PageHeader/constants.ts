import type { UserRole } from '../../core/auth/types';

export const partyList = [
  {
    id: 'mario-rossi',
    name: 'Mario Rossi',
    productRole: 'Amministratore',
    parentName: 'Dipartimento Politiche per la Disabilità',
  },
  {
    id: 'giuseppe-rossi',
    name: 'Giuseppe Rossi',
    productRole: 'Operatore',
    parentName: 'Comune di Ferrara',
  },
];

export const partyRoleMap: Record<string, UserRole> = {
  'mario-rossi': 'admin',
  'giuseppe-rossi': 'operator',
};

export const productsList = [
  {
    id: 'ced',
    title: 'Carta Europea della Disabilita',
    productUrl: '/',
    linkType: 'internal' as const,
  },
];
