import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL as string;
  }
  if (axios.defaults.baseURL) {
    return axios.defaults.baseURL as string;
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

/**
 * Normalize avatar or media URLs coming from the backend.
 * - Absolute http/https URLs are returned as-is.
 * - Any other non-empty path is treated as relative to the API base URL.
 */
export const resolveMediaUrl = (raw?: string | null): string | null => {
  if (!raw || typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  const base = getApiBaseUrl().replace(/\/$/, '');
  const path = trimmed.replace(/^\//, '');
  return base ? `${base}/${path}` : `/${path}`;
};
