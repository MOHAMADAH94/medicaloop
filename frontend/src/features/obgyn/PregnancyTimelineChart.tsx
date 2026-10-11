import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SpecialtyChartShell, { ChartLegendItem } from '@/shared/components/SpecialtyChartShell';
import { fmtDate } from '@/shared/utils/format';

interface PregnancyTimelineChartProps {
  lmpDate?: string;
  eddDate?: string;
  gestationalWeeks?: number;
  gestationalDays?: number;
  status?: string;
  onWeekSelect?: (week: number) => void;
  onTrimesterSelect?: (trimester: number) => void;
}

const MILESTONES = [
  { week: 6, labelKey: 'obgyn.msDating' },
  { week: 12, labelKey: 'obgyn.msNt' },
  { week: 16, labelKey: 'obgyn.msQuad' },
  { week: 20, labelKey: 'obgyn.msAnatomy' },
  { week: 24, labelKey: 'obgyn.msGtt' },
  { week: 28, labelKey: 'obgyn.msAntiD' },
  { week: 32, labelKey: 'obgyn.msGrowth' },
  { week: 36, labelKey: 'obgyn.msGbs' },
  { week: 40, labelKey: 'obgyn.msTerm' },
];

function trimesterOf(week: number) {
  if (week <= 13) return 1;
  if (week <= 27) return 2;
  return 3;
}

function weekColor(week: number, current?: number) {
  if (current != null && week === current) return '#6A1B9A';
  const t = trimesterOf(week);
  if (t === 1) return '#F8BBD0';
  if (t === 2) return '#CE93D8';
  return '#AB47BC';
}

export default function PregnancyTimelineChart({
  lmpDate,
  eddDate,
  gestationalWeeks,
  gestationalDays,
  status,
  onWeekSelect,
  onTrimesterSelect,
}: PregnancyTimelineChartProps) {
  const { t } = useTranslation();
  const current = gestationalWeeks != null ? Math.min(40, Math.max(1, gestationalWeeks)) : undefined;
  const progress = gestationalWeeks != null
    ? Math.min(100, ((gestationalWeeks + (gestationalDays ?? 0) / 7) / 40) * 100)
    : 0;

  return (
    <SpecialtyChartShell
      title={t('obgyn.timelineTitle')}
      subtitle={t('obgyn.timelineHint')}
      legend={(
        <>
          <ChartLegendItem color="#F8BBD0" label={`${t('obgyn.t1')} 1–13`} />
          <ChartLegendItem color="#CE93D8" label={`${t('obgyn.t2')} 14–27`} />
          <ChartLegendItem color="#AB47BC" label={`${t('obgyn.t3')} 28–40`} />
        </>
      )}
    >
      <Stack spacing={1.75}>
        {gestationalWeeks != null && (
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="h4" fontWeight={800} color="primary.main">
              {gestationalWeeks}{t('obgyn.weeksShort')} + {gestationalDays ?? 0}{t('obgyn.daysShort')}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}% · {status || t('obgyn.statusActive')}
            </Typography>
          </Stack>
        )}

        <Stack direction="row" spacing={1}>
          {[1, 2, 3].map((tr) => (
            <Box
              key={tr}
              onClick={() => onTrimesterSelect?.(tr)}
              sx={{
                flex: 1,
                py: 0.5,
                borderRadius: 1,
                textAlign: 'center',
                cursor: onTrimesterSelect ? 'pointer' : 'default',
                bgcolor: tr === 1 ? '#F8BBD0' : tr === 2 ? '#CE93D8' : '#AB47BC',
                outline: current && trimesterOf(current) === tr ? '2px solid #4A148C' : 'none',
              }}
            >
              <Typography variant="caption" fontWeight={800} color="#4A148C">
                {t(`obgyn.t${tr}` as 'obgyn.t1')}
              </Typography>
            </Box>
          ))}
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 1fr)',
            gap: 0.5,
          }}
        >
          {Array.from({ length: 40 }, (_, i) => i + 1).map((week) => {
            const isCurrent = current === week;
            const passed = current != null && week < current;
            return (
              <Box
                key={week}
                onClick={() => onWeekSelect?.(week)}
                sx={{
                  height: 28,
                  borderRadius: 0.75,
                  bgcolor: weekColor(week, current),
                  color: isCurrent ? '#fff' : '#4A148C',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: onWeekSelect ? 'pointer' : 'default',
                  fontSize: 11,
                  fontWeight: isCurrent ? 800 : 600,
                  opacity: passed ? 0.72 : 1,
                  outline: isCurrent ? '2px solid #4A148C' : 'none',
                  '&:hover': { filter: 'brightness(0.95)' },
                }}
                title={`${t('obgyn.week')} ${week}`}
              >
                {week}
              </Box>
            );
          })}
        </Box>

        <Stack spacing={0.5}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">{t('obgyn.milestones')}</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>
            {MILESTONES.map((m) => (
              <Box
                key={m.week}
                onClick={() => onWeekSelect?.(m.week)}
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: current === m.week ? 'secondary.main' : 'divider',
                  bgcolor: current != null && current >= m.week ? '#F3E5F5' : 'background.paper',
                  cursor: onWeekSelect ? 'pointer' : 'default',
                }}
              >
                <Typography variant="caption" fontWeight={700}>
                  {m.week}{t('obgyn.weeksShort')} · {t(m.labelKey)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>

        <Stack direction="row" justifyContent="space-between">
          <Box>
            <Typography variant="caption" color="text.secondary">{t('obgyn.lmp')}</Typography>
            <Typography variant="body2" fontWeight={600}>{lmpDate ? fmtDate(lmpDate) : '—'}</Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary">{t('obgyn.edd')}</Typography>
            <Typography variant="body2" fontWeight={600}>{eddDate ? fmtDate(eddDate) : '—'}</Typography>
          </Box>
        </Stack>
      </Stack>
    </SpecialtyChartShell>
  );
}
