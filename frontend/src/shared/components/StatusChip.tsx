import { Chip } from '@mui/material';
import { useTranslation } from 'react-i18next';

const COLORS: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
  in_progress: 'info',
  draft: 'default',
  paid: 'success',
  overdue: 'error',
  active: 'success',
  high: 'error',
  medium: 'warning',
  low: 'info',
};

interface Props {
  status: string;
  namespace?: string;
}

export default function StatusChip({ status, namespace = 'appointments.statuses' }: Props) {
  const { t } = useTranslation();
  return (
    <Chip
      label={t(`${namespace}.${status}`, status)}
      color={COLORS[status] || 'default'}
      size="small"
    />
  );
}
