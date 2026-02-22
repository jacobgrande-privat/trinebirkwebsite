const BACKOFFICE_SESSION_TOKEN_KEY = 'backoffice-session-token';

export const getBackofficeSessionToken = (): string | null =>
  window.sessionStorage.getItem(BACKOFFICE_SESSION_TOKEN_KEY);

export const setBackofficeSessionToken = (token: string): void =>
  window.sessionStorage.setItem(BACKOFFICE_SESSION_TOKEN_KEY, token);

export const clearBackofficeSessionToken = (): void =>
  window.sessionStorage.removeItem(BACKOFFICE_SESSION_TOKEN_KEY);
