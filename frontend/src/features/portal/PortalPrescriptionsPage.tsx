import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface Prescription {
  id: string;
  created_at: string;
  items: { medication_name: string; dosage: string; frequency: string; duration: string }[];
}

export default function PortalPrescriptionsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Prescription[]>([]);

  useEffect(() => {
    apiClient.get('/patient/prescriptions/').then((res) => setItems(unwrapList(res.data)));
  }, []);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.prescriptions')} />
      {items.length === 0 ? (
        <Typography color="text.secondary">{t('prescriptions.empty')}</Typography>
      ) : items.map((p) => (
        <Card key={p.id}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>{fmtDateTime(p.created_at)}</Typography>
            {p.items?.map((item, i) => (
              <Stack key={i} sx={{ mb: 1 }}>
                <Typography fontWeight={600}>{item.medication_name}</Typography>
                <Typography variant="body2">{item.dosage} — {item.frequency} — {item.duration}</Typography>
                {i < p.items.length - 1 && <Divider sx={{ mt: 1 }} />}
              </Stack>
            ))}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
