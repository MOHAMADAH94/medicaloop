import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { WEEKDAYS, WorkingHour, formatTime, groupWorkingHoursByDay } from '@/shared/utils/workingHours';

interface Props {
  hours: WorkingHour[];
  title?: string;
}

export default function WorkingHoursDisplay({ hours, title }: Props) {
  const { t } = useTranslation();
  const grouped = groupWorkingHoursByDay(hours);

  if (grouped.size === 0) {
    return <Typography color="text.secondary">{t('settings.noWorkingHours')}</Typography>;
  }

  return (
    <Stack spacing={1}>
      {title && <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>}
      {WEEKDAYS.map((key, index) => {
        const periods = grouped.get(index);
        if (!periods?.length) return null;
        return (
          <Stack key={key} direction="row" justifyContent="space-between" sx={{ py: 0.5 }}>
            <Typography>{t(`settings.days.${key}`)}</Typography>
            <Typography color="text.secondary">
              {periods.map((p) => `${formatTime(p.start_time)} – ${formatTime(p.end_time)}`).join('، ')}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
