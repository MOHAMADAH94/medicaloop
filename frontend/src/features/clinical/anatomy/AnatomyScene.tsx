import { Box } from '@mui/material';
import type { ReactNode } from 'react';

export function AnatomyStage({
  viewBox,
  maxWidth,
  children,
}: {
  viewBox: string;
  maxWidth?: number;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        borderRadius: 2.5,
        px: 1,
        py: 1.5,
        background:
          'radial-gradient(ellipse at 50% 18%, #ffffff 0%, #EEF3F7 42%, #D7E1EA 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <svg
        viewBox={viewBox}
        width="100%"
        style={{
          maxWidth: maxWidth ?? 360,
          display: 'block',
          filter: 'drop-shadow(0 16px 22px rgba(38, 50, 56, 0.18))',
        }}
      >
        {children}
      </svg>
    </Box>
  );
}

export function AnatomyPin({
  x,
  y,
  index,
  color,
  label,
  selected,
  active,
  onClick,
}: {
  x: number;
  y: number;
  index: number;
  color: string;
  label: string;
  selected?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  const r = selected ? 9 : 7.4;
  return (
    <g onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <title>{label}</title>
      {selected && <circle cx={x} cy={y} r={r + 7} fill={color} opacity={0.16} />}
      <circle cx={x} cy={y + 1.4} r={r} fill="rgba(0,0,0,0.22)" />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={selected ? color : active ? '#FFF8E1' : '#fff'}
        stroke={color}
        strokeWidth={selected ? 2.5 : 2}
      />
      <text
        x={x}
        y={y + 3.2}
        textAnchor="middle"
        fontSize={8}
        fontWeight={800}
        fill={selected ? '#fff' : '#263238'}
        pointerEvents="none"
      >
        {index}
      </text>
    </g>
  );
}
