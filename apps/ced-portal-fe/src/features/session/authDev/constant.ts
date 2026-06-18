export const DEV_OPERATOR_ASSERTION_TOKEN = import.meta.env
  .VITE_DEV_OPERATOR_ASSERTION_TOKEN;

export const DEV_ADMIN_ASSERTION_TOKEN = import.meta.env
  .VITE_DEV_ADMIN_ASSERTION_TOKEN;

export const DEV_SELECTED_PARTY_KEY = 'ced-portal-selected-party-id';
export const SESSION_EXCHANGE_KEY = 'ced-portal-last-session-exchange-id';
export const ACS_EXCHANGE_KEY = 'ced-portal-last-acs-assertion-token';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
