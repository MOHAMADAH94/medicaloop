import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import SpecialtyChartShell, { ChartLegendItem, ZoneChipPicker } from '@/shared/components/SpecialtyChartShell';

export const CARE_DOMAINS = [
  { id: 'diagnosis', labelKey: 'generalCare.domainDiagnosis', angle: 0, color: '#1565C0' },
  { id: 'medication', labelKey: 'generalCare.domainMedication', angle: 45, color: '#00897B' },
  { id: 'lifestyle', labelKey: 'generalCare.domainLifestyle', angle: 90, color: '#558B2F' },
  { id: 'followup', labelKey: 'generalCare.domainFollowUp', angle: 135, color: '#EF6C00' },
  { id: 'labs', labelKey: 'generalCare.domainLabs', angle: 180, color: '#6A1B9A' },
  { id: 'education', labelKey: 'generalCare.domainEducation', angle: 225, color: '#C2185B' },
  { id: 'referral', labelKey: 'generalCare.domainReferral', angle: 270, color: '#455A64' },
  { id: 'prevention', labelKey: 'generalCare.domainPrevention', angle: 315, color: '#0277BD' },
] as const;

interface CarePlanWheelProps {
  selected?: string;
  activeDomains?: string[];
  onSelect: (domainId: string) => void;
}

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export default function CarePlanWheel({ selected, activeDomains = [], onSelect }: CarePlanWheelProps) {
  const { t } = useTranslation();
  const cx = 120;
  const cy = 120;
  const r = 96;
  const slice = 360 / CARE_DOMAINS.length;

  return (
    <SpecialtyChartShell
      title={t('generalCare.wheelTitle')}
      subtitle={t('generalCare.wheelHint')}
      legend={CARE_DOMAINS.slice(0, 4).map((d) => (
        <ChartLegendItem key={d.id} color={d.color} label={t(d.labelKey)} />
      ))}
      picker={(
        <ZoneChipPicker
          zones={CARE_DOMAINS.map((d) => ({ id: d.id, label: t(d.labelKey), color: d.color }))}
          selected={selected}
          activeIds={activeDomains}
          onSelect={(id) => onSelect(id)}
        />
      )}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <svg viewBox="0 0 240 240" width="100%" style={{ maxWidth: 280, display: 'block' }}>
          {CARE_DOMAINS.map((d) => {
            const start = d.angle - slice / 2 + 2;
            const end = d.angle + slice / 2 - 2;
            const isSelected = selected === d.id;
            const isActive = activeDomains.includes(d.id);
            const mid = polar(cx, cy, r * 0.68, d.angle);
            return (
              <g key={d.id} onClick={() => onSelect(d.id)} style={{ cursor: 'pointer' }}>
                <title>{t(d.labelKey)}</title>
                <path
                  d={sectorPath(cx, cy, r, start, end)}
                  fill={isSelected ? d.color : isActive ? `${d.color}88` : `${d.color}33`}
                  stroke={isSelected ? d.color : '#fff'}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                />
                <text
                  x={mid.x}
                  y={mid.y + 3}
                  textAnchor="middle"
                  fontSize={8}
                  fontWeight={700}
                  fill={isSelected ? '#fff' : '#37474F'}
                  pointerEvents="none"
                >
                  {t(d.labelKey).slice(0, 8)}
                </text>
              </g>
            );
          })}
          <circle cx={cx} cy={cy} r={32} fill="#fff" stroke="#1565C0" strokeWidth={2} />
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1565C0">
            {t('generalCare.wheelCenter')}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8} fill="#78909C">
            {t('generalCare.wheelCenterSub')}
          </text>
        </svg>
      </Box>
    </SpecialtyChartShell>
  );
}
