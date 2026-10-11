import { Box, Chip, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SpecialtyChartShell, { ChartLegendItem } from '@/shared/components/SpecialtyChartShell';

export interface VaccineRef {
  vaccine_name: string;
  dose_number: number;
  scheduled_date?: string;
  status: string;
}

export const IMMUNIZATION_SCHEDULE = [
  { name: 'BCG', dose: 1, age: 'عند الولادة' },
  { name: 'Hepatitis B', dose: 1, age: 'عند الولادة' },
  { name: 'Polio', dose: 1, age: 'عند الولادة' },
  { name: 'Hexavalent', dose: 1, age: 'شهرين' },
  { name: 'PCV', dose: 1, age: 'شهرين' },
  { name: 'Rotavirus', dose: 1, age: 'شهرين' },
  { name: 'Hexavalent', dose: 2, age: '4 أشهر' },
  { name: 'PCV', dose: 2, age: '4 أشهر' },
  { name: 'Rotavirus', dose: 2, age: '4 أشهر' },
  { name: 'Hexavalent', dose: 3, age: '6 أشهر' },
  { name: 'PCV', dose: 3, age: '6 أشهر' },
  { name: 'Polio', dose: 2, age: '6 أشهر' },
  { name: 'Influenza', dose: 1, age: '6 أشهر+' },
  { name: 'Measles', dose: 1, age: '9 أشهر' },
  { name: 'MMR', dose: 1, age: '12 شهر' },
  { name: 'Varicella', dose: 1, age: '12 شهر' },
  { name: 'PCV', dose: 4, age: '12 شهر' },
  { name: 'Hepatitis A', dose: 1, age: '12 شهر' },
  { name: 'MMR', dose: 2, age: '18 شهر' },
  { name: 'DTP', dose: 4, age: '18 شهر' },
  { name: 'Polio', dose: 3, age: '18 شهر' },
  { name: 'Hepatitis A', dose: 2, age: '18 شهر' },
  { name: 'Meningococcal', dose: 1, age: 'سنتين' },
  { name: 'DTP', dose: 5, age: '4–6 سنوات' },
  { name: 'Polio', dose: 4, age: '4–6 سنوات' },
  { name: 'MMR', dose: 3, age: '4–6 سنوات' },
] as const;

export const COMMON_VACCINES = [...new Set(IMMUNIZATION_SCHEDULE.map((v) => v.name))];

const STATUS_COLOR: Record<string, string> = {
  given: '#26A69A',
  due: '#FFB300',
  overdue: '#EF5350',
  skipped: '#B0BEC5',
  pending: '#ECEFF1',
};

interface ImmunizationTimelineProps {
  vaccines: VaccineRef[];
  onSelect?: (name: string) => void;
}

function matchStatus(vaccines: VaccineRef[], name: string, dose: number) {
  const hit = vaccines.find((v) => v.vaccine_name === name && v.dose_number === dose)
    ?? vaccines.find((v) => v.vaccine_name === name);
  return hit?.status;
}

export default function ImmunizationTimeline({ vaccines, onSelect }: ImmunizationTimelineProps) {
  const { t } = useTranslation();

  return (
    <SpecialtyChartShell
      title={t('pediatrics.vaccineTimelineTitle')}
      subtitle={t('pediatrics.vaccineTimelineHint')}
      legend={(
        <>
          <ChartLegendItem color={STATUS_COLOR.given} label={t('pediatrics.statusGiven')} />
          <ChartLegendItem color={STATUS_COLOR.due} label={t('pediatrics.statusDue')} />
          <ChartLegendItem color={STATUS_COLOR.overdue} label={t('pediatrics.statusOverdue')} />
          <ChartLegendItem color={STATUS_COLOR.pending} border="#90A4AE" label={t('pediatrics.statusPending')} />
        </>
      )}
    >
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))', gap: 0.75 }}>
        {IMMUNIZATION_SCHEDULE.map((slot) => {
          const status = matchStatus(vaccines, slot.name, slot.dose) ?? 'pending';
          return (
            <Chip
              key={`${slot.name}-${slot.dose}-${slot.age}`}
              clickable={Boolean(onSelect)}
              onClick={() => onSelect?.(slot.name)}
              label={(
                <Stack spacing={0} sx={{ py: 0.25 }}>
                  <Typography variant="caption" fontWeight={700} lineHeight={1.2}>
                    {slot.name} · {slot.dose}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontSize={10} lineHeight={1.2}>
                    {slot.age}
                  </Typography>
                </Stack>
              )}
              sx={{
                height: 'auto',
                borderRadius: 1.5,
                justifyContent: 'flex-start',
                bgcolor: STATUS_COLOR[status] ?? STATUS_COLOR.pending,
                color: status === 'pending' ? 'text.primary' : '#fff',
                '& .MuiChip-label': { px: 1, py: 0.5, width: '100%' },
              }}
            />
          );
        })}
      </Box>
    </SpecialtyChartShell>
  );
}
