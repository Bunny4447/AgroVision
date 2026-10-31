// Production API configuration
// Reads VITE_API_URL environment variable if set; otherwise falls back to empty string for same-origin proxy
const envApiUrl = (import.meta as any).env?.VITE_API_URL || '';
export const API_BASE: string = String(envApiUrl).replace(/\/$/, '');

export const apiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${API_BASE}${cleanEndpoint}`;
};
