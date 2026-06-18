import {
  ACS_EXCHANGE_KEY,
  DEV_SELECTED_PARTY_KEY,
  SESSION_EXCHANGE_KEY,
} from './constant';

export const devAuthStorage = {
  getSelectedPartyId: () =>
    window.sessionStorage.getItem(DEV_SELECTED_PARTY_KEY),

  setSelectedPartyId: (partyId: string) =>
    window.sessionStorage.setItem(DEV_SELECTED_PARTY_KEY, partyId),

  getLastSessionExchangeId: () =>
    window.sessionStorage.getItem(SESSION_EXCHANGE_KEY),

  setLastSessionExchangeId: (id: string) =>
    window.sessionStorage.setItem(SESSION_EXCHANGE_KEY, id),

  removeLastSessionExchangeId: () =>
    window.sessionStorage.removeItem(SESSION_EXCHANGE_KEY),

  getLastAcsToken: () => window.sessionStorage.getItem(ACS_EXCHANGE_KEY),

  setLastAcsToken: (token: string) =>
    window.sessionStorage.setItem(ACS_EXCHANGE_KEY, token),

  removeLastAcsToken: () => window.sessionStorage.removeItem(ACS_EXCHANGE_KEY),

  clearGuards: () => {
    window.sessionStorage.removeItem(SESSION_EXCHANGE_KEY);
    window.sessionStorage.removeItem(ACS_EXCHANGE_KEY);
  },
};
