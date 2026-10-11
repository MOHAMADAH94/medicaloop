import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import LoadingBox from '@/shared/components/LoadingBox';
import { useToast } from '@/shared/feedback/ToastProvider';
import { fmtDateTime } from '@/shared/utils/format';
import { extractApiError } from '@/shared/utils/errors';

interface AuditEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string | null;
  actor_name: string;
  actor_username: string;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

const ACTION_COLORS: Record<string, 'success' | 'error' | 'warning' | 'info' | 'default'> = {
  created: 'success',
  invited: 'success',
  updated: 'info',
  deleted: 'error',
  deactivated: 'warning',
  unlinked: 'warning',
};

function actionColor(action: string) {
  const verb = action.split('.').pop() ?? '';
  return ACTION_COLORS[verb] ?? 'default';
}

export default function AuditLogPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resourceFilter, setResourceFilter] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page: page + 1 };
    if (resourceFilter) params.resource_type = resourceFilter;

    apiClient
      .get('/staff/audit-logs/', { params })
      .then((res) => {
        setEntries(res.data.results ?? []);
        setCount(res.data.count ?? 0);
      })
      .catch((err) => toast.error(extractApiError(err, t('common.error'))))
      .finally(() => setLoading(false));
  }, [page, resourceFilter, toast, t]);

  useEffect(load, [load]);

  const resourceTypes = useMemo(
    () => [...new Set(entries.map((e) => e.resource_type))].sort(),
    [entries],
  );

  return (
    <Stack spacing={2}>
      <PageHeader title={t('audit.title')} subtitle={t('audit.subtitle')} />

      <TextField
        select size="small" sx={{ maxWidth: 260 }}
        label={t('audit.filterResource')}
        value={resourceFilter}
        onChange={(e) => { setResourceFilter(e.target.value); setPage(0); }}
      >
        <MenuItem value="">{t('audit.allResources')}</MenuItem>
        {resourceTypes.map((type) => (
          <MenuItem key={type} value={type}>{type}</MenuItem>
        ))}
      </TextField>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? <LoadingBox /> : (
          <>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('audit.when')}</TableCell>
                  <TableCell>{t('audit.actor')}</TableCell>
                  <TableCell>{t('audit.action')}</TableCell>
                  <TableCell>{t('audit.resource')}</TableCell>
                  <TableCell>{t('audit.details')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}><EmptyState message={t('audit.empty')} /></TableCell>
                  </TableRow>
                ) : entries.map((entry) => (
                  <TableRow key={entry.id} hover>
                    <TableCell sx={{ whiteSpace: 'nowrap' }}>{fmtDateTime(entry.created_at)}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">{entry.actor_name || '—'}</Typography>
                        {entry.actor_username && (
                          <Typography variant="caption" color="text.secondary">@{entry.actor_username}</Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" color={actionColor(entry.action)} label={entry.action} />
                    </TableCell>
                    <TableCell>{entry.resource_type}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {Object.keys(entry.metadata ?? {}).length
                          ? Object.entries(entry.metadata).map(([k, v]) => `${k}: ${v}`).join(' · ')
                          : '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              count={count}
              page={page}
              rowsPerPage={20}
              rowsPerPageOptions={[20]}
              onPageChange={(_, next) => setPage(next)}
            />
          </>
        )}
      </Paper>
    </Stack>
  );
}
