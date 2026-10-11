import { AxiosError } from 'axios';

function firstString(value: unknown): string | null {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = firstString(item);
      if (found) return found;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    for (const item of Object.values(value)) {
      const found = firstString(item);
      if (found) return found;
    }
  }
  return null;
}

/** Pull a human-readable message out of the API's `{ error: { detail } }` envelope. */
export function extractApiError(error: unknown, fallback: string): string {
  if (error instanceof AxiosError) {
    const payload = error.response?.data as { error?: { detail?: unknown } } | undefined;
    return firstString(payload?.error?.detail) ?? firstString(payload) ?? fallback;
  }
  return fallback;
}
