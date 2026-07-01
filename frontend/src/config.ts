export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function getAuthHeaders(): HeadersInit {
  const auth = JSON.parse(localStorage.getItem('mp_auth') || 'null');
  return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
}
