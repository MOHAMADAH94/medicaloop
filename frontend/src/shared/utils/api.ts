export function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'results' in data) {
    return (data as { results: T[] }).results ?? [];
  }
  return [];
}
