import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import StatusChip from '@/shared/components/StatusChip';
import EmptyState from '@/shared/components/EmptyState';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface Visit {
  id: string;
  patient: string;
  visit_date: string;
  status: string;
  chief_complaint: string;
}

export default function VisitsPage() {
  const { t } = useTranslation();
  const [visits, setVisits] = useState<Visit[]>([]);

  const load = useCallback(() => {
    apiClient.get('/staff/visits/').then((res) => setVisits(unwrapList(res.data)));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.visits')} subtitle={t('visits.subtitle')} />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('visits.date')}</TableCell>
              <TableCell>{t('visits.complaint')}</TableCell>
              <TableCell>{t('appointments.status')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.length === 0 ? (
              <TableRow><TableCell colSpan={4}><EmptyState message={t('visits.empty')} /></TableCell></TableRow>
            ) : visits.map((v) => (
              <TableRow key={v.id} hover>
                <TableCell>{fmtDateTime(v.visit_date)}</TableCell>
                <TableCell>{v.chief_complaint || '—'}</TableCell>
                <TableCell><StatusChip status={v.status} namespace="visits.statuses" /></TableCell>
                <TableCell>
                  <Button size="small" component={RouterLink} to={`/dashboard/visits/${v.id}`}>
                    {t('visits.open')}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
