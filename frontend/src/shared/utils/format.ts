export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('ar-SA');
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('ar-SA');
}

export function fmtMoney(amount: string | number | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '—';
  return `${Number(amount).toLocaleString('ar-SA')} ر.س`;
}
