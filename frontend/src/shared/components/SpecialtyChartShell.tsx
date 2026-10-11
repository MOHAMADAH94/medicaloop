import { Box, Chip, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface SpecialtyChartShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  legend?: ReactNode;
  picker?: ReactNode;
}

/** Branded wrapper matching the dental odontogram presentation. */
export default function SpecialtyChartShell({ title, subtitle, children, legend, picker }: SpecialtyChartShellProps) {
  return (
    <Box
      sx={{
        borderRadius: 3,
        overflow: 'hidden',
        bgcolor: '#FAFCFD',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <Box sx={{ px: 2, py: 1.5, bgcolor: 'primary.main', color: '#fff' }}>
        <Typography variant="subtitle1" fontWeight={700}>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ opacity: 0.9 }}>{subtitle}</Typography>
        )}
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
      {picker && (
        <Box sx={{ px: 2, pb: 1.5 }}>
          {picker}
        </Box>
      )}
      {legend && (
        <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" useFlexGap sx={{ px: 2, pb: 2 }}>
          {legend}
        </Stack>
      )}
    </Box>
  );
}

export function ChartLegendItem({ color, border, label }: { color: string; border?: string; label: string }) {
  return (
    <Stack direction="row" alignItems="center" spacing={0.5}>
      <Box sx={{ width: 14, height: 14, borderRadius: 0.5, bgcolor: color, border: `1px solid ${border ?? color}` }} />
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Stack>
  );
}

export function ZoneChipPicker({
  zones,
  selected,
  activeIds,
  onSelect,
}: {
  zones: { id: string; label: string; color?: string }[];
  selected?: string;
  activeIds?: string[];
  onSelect?: (id: string, label: string) => void;
}) {
  if (zones.length === 0) return null;
  return (
    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap justifyContent="center">
      {zones.map((z) => {
        const isSelected = selected === z.id;
        const isActive = activeIds?.includes(z.id);
        return (
          <Chip
            key={z.id}
            size="small"
            label={z.label}
            clickable={Boolean(onSelect)}
            onClick={() => onSelect?.(z.id, z.label)}
            color={isSelected ? 'primary' : 'default'}
            variant={isSelected || isActive ? 'filled' : 'outlined'}
            sx={{
              fontWeight: 600,
              bgcolor: isSelected ? undefined : isActive ? `${z.color ?? '#90CAF9'}55` : undefined,
            }}
          />
        );
      })}
    </Stack>
  );
}
