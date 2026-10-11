import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import StatusChip from '@/shared/components/StatusChip';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface FollowUp {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  patient_instructions: string;
}

export default function PortalFollowUpsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<FollowUp[]>([]);

  useEffect(() => {
    apiClient.get('/patient/followups/').then((res) => setItems(unwrapList(res.data)));
  }, []);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.followups')} />
      {items.length === 0 ? (
        <Typography color="text.secondary">{t('followups.empty')}</Typography>
      ) : items.map((item) => (
        <Card key={item.id}>
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography fontWeight={600}>{item.title}</Typography>
              <StatusChip status={item.status} namespace="followups.statuses" />
            </Stack>
            {item.due_date && <Typography variant="body2" sx={{ mt: 1 }}>{t('followups.dueDate')}: {fmtDate(item.due_date)}</Typography>}
            {item.patient_instructions && <Typography variant="body2" sx={{ mt: 1 }}>{item.patient_instructions}</Typography>}
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
