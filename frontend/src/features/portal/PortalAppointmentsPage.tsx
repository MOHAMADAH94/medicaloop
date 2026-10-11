import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface Appointment {
  id: string;
  scheduled_start: string;
  status: string;
}

export default function PortalAppointmentsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Appointment[]>([]);

  useEffect(() => {
    apiClient.get('/patient/appointments/').then((res) => setItems(unwrapList(res.data)));
  }, []);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.appointments')} />
      {items.length === 0 ? (
        <Typography color="text.secondary">{t('portal.noAppointments')}</Typography>
      ) : items.map((a) => (
        <Card key={a.id}>
          <CardContent>
            <Typography variant="h6">{fmtDateTime(a.scheduled_start)}</Typography>
            <Chip label={a.status} size="small" sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
