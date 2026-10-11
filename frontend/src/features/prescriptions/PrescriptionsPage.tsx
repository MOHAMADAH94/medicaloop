import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Paper, Stack, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface Prescription {
  id: string;
  patient: string;
  created_at: string;
  items: { medication_name: string; dosage: string }[];
}

export default function PrescriptionsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Prescription[]>([]);

  const load = useCallback(() => {
    apiClient.get('/staff/prescriptions/').then((res) => setItems(unwrapList(res.data)));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.prescriptions')} subtitle={t('prescriptions.subtitle')} />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('prescriptions.date')}</TableCell>
              <TableCell>{t('prescriptions.medications')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={2}><EmptyState message={t('prescriptions.empty')} /></TableCell></TableRow>
            ) : items.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{fmtDateTime(p.created_at)}</TableCell>
                <TableCell>
                  {p.items?.map((i) => `${i.medication_name} (${i.dosage})`).join('، ') || '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
