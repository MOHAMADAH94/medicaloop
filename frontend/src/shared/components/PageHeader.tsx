import { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={600}>{title}</Typography>
        {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
      </Stack>
      {action}
    </Stack>
  );
}
