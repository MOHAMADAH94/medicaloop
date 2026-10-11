export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

export function hasAccessToken(): boolean {
  return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
}

export function saveTokens(access: string, refresh: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

interface JwtPayload {
  user_type?: string;
  active_clinic_id?: string;
  patient_id?: string;
  exp?: number;
}

export function readTokenPayload(): JwtPayload | null {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (!token) return null;
  try {
    const [, payload] = token.split('.');
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(json))) as JwtPayload;
  } catch {
    return null;
  }
}
