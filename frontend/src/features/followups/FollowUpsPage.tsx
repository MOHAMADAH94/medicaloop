import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import StatusChip from '@/shared/components/StatusChip';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface FollowUpItem {
  id: string;
  title: string;
  due_date: string | null;
  status: string;
  patient_instructions: string;
}

export default function FollowUpsPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);
  const [items, setItems] = useState<FollowUpItem[]>([]);

  const load = useCallback(() => {
    const url = tab === 1 ? '/staff/followup-items/overdue/' : '/staff/followup-items/';
    apiClient.get(url).then((res) => setItems(Array.isArray(res.data) ? res.data : unwrapList(res.data)));
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const complete = async (id: string) => {
    await apiClient.post(`/staff/followup-items/${id}/complete/`);
    load();
  };

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.followups')} subtitle={t('followups.subtitle')} />
      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={t('followups.all')} />
        <Tab label={t('followups.overdue')} />
      </Tabs>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('followups.title')}</TableCell>
              <TableCell>{t('followups.dueDate')}</TableCell>
              <TableCell>{t('appointments.status')}</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow><TableCell colSpan={4}><EmptyState message={t('followups.empty')} /></TableCell></TableRow>
            ) : items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.title}</TableCell>
                <TableCell>{fmtDate(item.due_date)}</TableCell>
                <TableCell><StatusChip status={item.status} namespace="followups.statuses" /></TableCell>
                <TableCell>
                  {item.status !== 'completed' && (
                    <Button size="small" variant="contained" onClick={() => complete(item.id)}>
                      {t('followups.complete')}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
