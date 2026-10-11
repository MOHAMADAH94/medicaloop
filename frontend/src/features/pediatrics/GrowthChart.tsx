import { Box, Stack, Typography } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import SpecialtyChartShell, { ChartLegendItem } from '@/shared/components/SpecialtyChartShell';

export interface GrowthPoint {
  age_months?: number | null;
  weight_kg?: string | null;
  height_cm?: string | null;
  head_circumference_cm?: string | null;
  record_date: string;
}

interface GrowthChartProps {
  records: GrowthPoint[];
}

type SeriesKey = 'weight_kg' | 'height_cm' | 'head_circumference_cm';

const PANELS: { key: SeriesKey; color: string; labelKey: string; unit: string; floor: number }[] = [
  { key: 'weight_kg', color: '#0288D1', labelKey: 'pediatrics.weight', unit: 'كغ', floor: 4 },
  { key: 'height_cm', color: '#00897B', labelKey: 'pediatrics.height', unit: 'سم', floor: 45 },
  { key: 'head_circumference_cm', color: '#6A1B9A', labelKey: 'pediatrics.headCircumference', unit: 'سم', floor: 32 },
];

function buildSeries(records: GrowthPoint[], key: SeriesKey) {
  return records
    .map((r) => ({
      x: r.age_months ?? 0,
      y: parseFloat(r[key] ?? ''),
    }))
    .filter((p) => !Number.isNaN(p.y) && p.y > 0)
    .sort((a, b) => a.x - b.x);
}

function MiniSpark({
  points,
  color,
  xMax,
  yMin,
  yMax,
  label,
  unit,
}: {
  points: { x: number; y: number }[];
  color: string;
  xMax: number;
  yMin: number;
  yMax: number;
  label: string;
  unit: string;
}) {
  const w = 320;
  const h = 88;
  const pad = { top: 10, right: 10, bottom: 18, left: 34 };
  const innerW = w - pad.left - pad.right;
  const innerH = h - pad.top - pad.bottom;
  const span = Math.max(yMax - yMin, 1);
  const sx = (v: number) => pad.left + (v / Math.max(xMax, 1)) * innerW;
  const sy = (v: number) => pad.top + innerH - ((v - yMin) / span) * innerH;
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${sx(p.x)} ${sy(p.y)}`).join(' ');
  const latest = points[points.length - 1];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ px: 0.5, mb: 0.25 }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary">{label}</Typography>
        {latest && (
          <Typography variant="caption" fontWeight={800} sx={{ color }}>{latest.y} {unit}</Typography>
        )}
      </Stack>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ display: 'block' }}>
        {[0, 0.5, 1].map((f) => (
          <line
            key={f}
            x1={pad.left}
            y1={pad.top + innerH * f}
            x2={w - pad.right}
            y2={pad.top + innerH * f}
            stroke="#ECEFF1"
          />
        ))}
        <text x={pad.left - 4} y={pad.top + 4} fontSize={8} fill="#90A4AE" textAnchor="end">{Math.round(yMax)}</text>
        <text x={pad.left - 4} y={pad.top + innerH} fontSize={8} fill="#90A4AE" textAnchor="end">{Math.round(yMin)}</text>
        <text x={w / 2} y={h - 2} fontSize={8} fill="#90A4AE" textAnchor="middle">شهر</text>
        {path && <path d={path} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" />}
        {points.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={3.5} fill={color}>
            <title>{`${p.x} شهر — ${p.y} ${unit}`}</title>
          </circle>
        ))}
      </svg>
    </Box>
  );
}

export default function GrowthChart({ records }: GrowthChartProps) {
  const { t } = useTranslation();
  const series = useMemo(
    () => PANELS.map((p) => ({ ...p, points: buildSeries(records, p.key) })),
    [records],
  );
  const xMax = Math.max(24, ...series.flatMap((s) => s.points.map((p) => p.x)));

  return (
    <SpecialtyChartShell
      title={t('pediatrics.growthChartTitle')}
      subtitle={t('pediatrics.growthChartHint')}
      legend={PANELS.map((p) => (
        <ChartLegendItem key={p.key} color={p.color} label={t(p.labelKey)} />
      ))}
    >
      {records.length === 0 ? (
        <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
          {t('pediatrics.growthChartEmpty')}
        </Typography>
      ) : (
        <Stack spacing={1.25}>
          {series.map((s) => {
            const ys = s.points.map((p) => p.y);
            const yMax = Math.max(s.floor * 1.4, ...(ys.length ? ys : [s.floor])) * 1.08;
            const yMin = Math.min(s.floor * 0.8, ...(ys.length ? ys : [s.floor])) * 0.92;
            return (
              <MiniSpark
                key={s.key}
                points={s.points}
                color={s.color}
                xMax={xMax}
                yMin={yMin}
                yMax={yMax}
                label={t(s.labelKey)}
                unit={s.unit}
              />
            );
          })}
        </Stack>
      )}
    </SpecialtyChartShell>
  );
}
