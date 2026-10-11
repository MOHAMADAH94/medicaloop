import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, List, ListItem, ListItemText, Paper, Stack, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface Notification {
  id: string;
  title: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export default function PortalNotificationsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Notification[]>([]);

  const load = useCallback(() => {
    apiClient.get('/patient/notifications/').then((res) => setItems(unwrapList(res.data)));
  }, []);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => {
    await apiClient.post(`/patient/notifications/${id}/read/`);
    load();
  };

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.notifications')} />
      <Paper>
        {items.length === 0 ? (
          <EmptyState message={t('notifications.empty')} />
        ) : (
          <List>
            {items.map((n) => (
              <ListItem
                key={n.id}
                secondaryAction={!n.read_at && <Button size="small" onClick={() => markRead(n.id)}>{t('notifications.markRead')}</Button>}
                sx={{ bgcolor: n.read_at ? 'transparent' : 'action.hover' }}
              >
                <ListItemText primary={n.title} secondary={<><Typography variant="body2">{n.body}</Typography><Typography variant="caption">{fmtDateTime(n.created_at)}</Typography></>} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Stack>
  );
}
