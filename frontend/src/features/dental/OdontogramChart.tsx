import { Box, Stack, Typography } from '@mui/material';
import { useId } from 'react';
import {
  TOOTH_STATUS_COLORS,
  TOOTH_STATUS_STROKE,
  ToothStatus,
  toothStatusFromTreatments,
} from './dentalProcedures';

/** FDI numbering — occlusal arches facing each other */
const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

interface TreatmentRef { tooth_number: string; status: string }

interface OdontogramChartProps {
  selected?: string;
  onSelect: (tooth: string) => void;
  treatments?: TreatmentRef[];
}

type Kind = 'incisor' | 'canine' | 'premolar' | 'molar';

function toothKind(n: number): Kind {
  const d = n % 10;
  if (d === 1 || d === 2) return 'incisor';
  if (d === 3) return 'canine';
  if (d === 4 || d === 5) return 'premolar';
  return 'molar';
}

function archPoint(i: number, upper: boolean) {
  const t = i / 15;
  if (upper) {
    const a = ((160 - t * 140) * Math.PI) / 180;
    return {
      x: 320 + 248 * Math.cos(a),
      y: 148 + 92 * Math.sin(a),
      rot: (i - 7.5) * 7.2,
    };
  }
  const a = ((200 + t * 140) * Math.PI) / 180;
  return {
    x: 320 + 248 * Math.cos(a),
    y: 372 + 92 * Math.sin(a),
    rot: (7.5 - i) * 7.2,
  };
}

function ToothCrown({
  num,
  x,
  y,
  rot,
  status,
  onClick,
}: {
  num: number;
  x: number;
  y: number;
  rot: number;
  status: ToothStatus;
  onClick: () => void;
}) {
  const fill = TOOTH_STATUS_COLORS[status];
  const stroke = TOOTH_STATUS_STROKE[status];
  const selected = status === 'selected';
  const kind = toothKind(num);
  const w = kind === 'molar' ? 22 : kind === 'premolar' ? 16 : kind === 'canine' ? 13 : 12;
  const h = kind === 'molar' ? 26 : 24;

  return (
    <g
      transform={`translate(${x} ${y}) rotate(${rot})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      <title>{num}</title>
      {kind === 'canine' ? (
        <path
          d={`M0 ${-h / 2 - 3} L${w / 2 - 1} ${-h / 6} L${w / 2} ${h / 2} Q0 ${h / 2 + 3} ${-w / 2} ${h / 2} L${-w / 2 + 1} ${-h / 6} Z`}
          fill={fill}
          stroke={stroke}
          strokeWidth={selected ? 2.4 : 1.15}
        />
      ) : (
        <rect
          x={-w / 2}
          y={-h / 2}
          width={w}
          height={h}
          rx={kind === 'incisor' ? 3 : 6}
          fill={fill}
          stroke={stroke}
          strokeWidth={selected ? 2.4 : 1.15}
        />
      )}
      {kind === 'molar' && (
        <g fill="#fff" opacity={0.35} pointerEvents="none">
          <circle cx={-5} cy={-4} r={3.1} />
          <circle cx={5} cy={-4} r={3.1} />
          <circle cx={-5} cy={5} r={3.1} />
          <circle cx={5} cy={5} r={3.1} />
        </g>
      )}
      {kind === 'premolar' && (
        <g fill="#fff" opacity={0.4} pointerEvents="none">
          <circle cx={-3.2} cy={-2} r={2.6} />
          <circle cx={3.2} cy={-2} r={2.6} />
        </g>
      )}
      {kind === 'incisor' && (
        <rect x={-3} y={-h / 2 + 3} width={6} height={4} rx={1} fill="#fff" opacity={0.35} pointerEvents="none" />
      )}
      <text
        y={3}
        textAnchor="middle"
        fontSize={9}
        fontWeight={800}
        fill={selected ? '#fff' : '#37474F'}
        pointerEvents="none"
      >
        {num}
      </text>
    </g>
  );
}

export default function OdontogramChart({ selected, onSelect, treatments = [] }: OdontogramChartProps) {
  const uid = useId().replace(/:/g, '');
  const upperPts = UPPER.map((_, i) => archPoint(i, true));
  const lowerPts = LOWER.map((_, i) => archPoint(i, false));

  const gumUpper = UPPER.map((_, i) => {
    const p = archPoint(i, true);
    return `${i === 0 ? 'M' : 'L'}${p.x} ${p.y + 14}`;
  }).join(' ');
  const gumLower = LOWER.map((_, i) => {
    const p = archPoint(i, false);
    return `${i === 0 ? 'M' : 'L'}${p.x} ${p.y - 14}`;
  }).join(' ');

  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#FAFCFD',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 24px rgba(0,131,143,0.08)',
      }}
    >
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: '#fff' }}>
        <Typography variant="subtitle1" fontWeight={700}>مخطط الفكين التفاعلي</Typography>
        <Typography variant="caption" sx={{ opacity: 0.9 }}>FDI — اضغط السن على القوس العلوي أو السفلي</Typography>
      </Box>
      <Box
        sx={{
          p: 2,
          background: 'radial-gradient(ellipse at 50% 40%, #ffffff 0%, #F3E9E4 55%, #E8D5CC 100%)',
        }}
      >
        <svg viewBox="0 0 640 520" width="100%" style={{ maxHeight: 460, display: 'block' }}>
          <defs>
            <linearGradient id={`jaw-gum-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F8BBD0" />
              <stop offset="100%" stopColor="#C2185B" />
            </linearGradient>
            <radialGradient id={`jaw-cavity-${uid}`} cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#6D2C2C" />
              <stop offset="100%" stopColor="#3E1F1C" />
            </radialGradient>
          </defs>

          {/* Oral cavity between arches */}
          <ellipse cx="320" cy="260" rx="210" ry="78" fill={`url(#jaw-cavity-${uid})`} opacity="0.55" />
          <ellipse cx="320" cy="268" rx="70" ry="28" fill="#C62828" opacity="0.35" />

          {/* Upper gingiva */}
          <path d={gumUpper} fill="none" stroke={`url(#jaw-gum-${uid})`} strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />
          {/* Lower gingiva */}
          <path d={gumLower} fill="none" stroke={`url(#jaw-gum-${uid})`} strokeWidth="28" strokeLinecap="round" strokeLinejoin="round" />

          <text x="320" y="36" textAnchor="middle" fontSize="13" fontWeight="800" fill="#6A1B9A">الفك العلوي</text>
          <text x="320" y="508" textAnchor="middle" fontSize="13" fontWeight="800" fill="#6A1B9A">الفك السفلي</text>
          <line x1="320" y1="118" x2="320" y2="400" stroke="#B0BEC5" strokeWidth="1" strokeDasharray="4 5" />
          <text x="86" y="260" fontSize="11" fill="#90A4AE">يمين المريض</text>
          <text x="554" y="260" textAnchor="end" fontSize="11" fill="#90A4AE">يسار المريض</text>

          {UPPER.map((num, i) => {
            const value = String(num);
            let status = toothStatusFromTreatments(value, treatments);
            if (selected === value) status = 'selected';
            const p = upperPts[i];
            return (
              <ToothCrown
                key={num}
                num={num}
                x={p.x}
                y={p.y}
                rot={p.rot}
                status={status}
                onClick={() => onSelect(value)}
              />
            );
          })}
          {LOWER.map((num, i) => {
            const value = String(num);
            let status = toothStatusFromTreatments(value, treatments);
            if (selected === value) status = 'selected';
            const p = lowerPts[i];
            return (
              <ToothCrown
                key={num}
                num={num}
                x={p.x}
                y={p.y}
                rot={p.rot}
                status={status}
                onClick={() => onSelect(value)}
              />
            );
          })}
        </svg>
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {([
            ['healthy', 'سليم'],
            ['planned', 'مخطط'],
            ['in_progress', 'قيد التنفيذ'],
            ['completed', 'مكتمل'],
          ] as const).map(([key, label]) => (
            <Stack key={key} direction="row" alignItems="center" spacing={0.5}>
              <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: TOOTH_STATUS_COLORS[key], border: `1px solid ${TOOTH_STATUS_STROKE[key]}` }} />
              <Typography variant="caption" color="text.secondary">{label}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
