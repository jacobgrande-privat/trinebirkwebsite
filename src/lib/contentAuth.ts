const CONTENT_ADMIN_TOKEN_STORAGE_KEY = 'content-admin-token';

export const getContentAdminToken = (): string | null => {
  return window.sessionStorage.getItem(CONTENT_ADMIN_TOKEN_STORAGE_KEY);
};

export const setContentAdminToken = (token: string): void => {
  window.sessionStorage.setItem(CONTENT_ADMIN_TOKEN_STORAGE_KEY, token);
};

export const clearContentAdminToken = (): void => {
  window.sessionStorage.removeItem(CONTENT_ADMIN_TOKEN_STORAGE_KEY);
};
