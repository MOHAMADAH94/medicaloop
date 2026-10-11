import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import type { SpecialtyUiConfig } from '@/shared/config/specialties';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import StatusChip from '@/shared/components/StatusChip';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface Patient {
  id: string;
  full_name: string;
}

interface SpecialtyRecordsPageProps {
  config: SpecialtyUiConfig;
}

function buildInitialForm(config: SpecialtyUiConfig, patientId?: string | null) {
  const form: Record<string, string> = {};
  config.formFields.forEach((field) => {
    if (field.type === 'select' && field.options?.length) {
      form[field.name] = field.options[0].value;
    } else if (field.type === 'patient' && patientId) {
      form[field.name] = patientId;
    } else {
      form[field.name] = '';
    }
  });
  return form;
}

export default function SpecialtyRecordsPage({ config }: SpecialtyRecordsPageProps) {
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [searchParams] = useSearchParams();
  const patientFilter = searchParams.get('patient');
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>(() => buildInitialForm(config, patientFilter));

  const load = useCallback(() => {
    const params = patientFilter ? { patient: patientFilter } : undefined;
    apiClient.get(config.apiPath, { params }).then((res) => setItems(unwrapList(res.data)));
  }, [config.apiPath, patientFilter]);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((res) => setPatients(unwrapList(res.data)));
  }, [load]);

  useEffect(() => {
    if (patientFilter) {
      setForm(buildInitialForm(config, patientFilter));
    }
  }, [patientFilter, config]);

  const create = async () => {
    const payload: Record<string, unknown> = { ...form };
    config.formFields.forEach((field) => {
      if (field.type === 'number' && payload[field.name] !== '') {
        payload[field.name] = Number(payload[field.name]);
      }
      if (field.type === 'number' && payload[field.name] === '') {
        delete payload[field.name];
      }
    });
    await apiClient.post(config.apiPath, payload);
    setOpen(false);
    setForm(buildInitialForm(config, patientFilter));
    load();
  };

  const renderCell = (item: Record<string, unknown>, col: SpecialtyUiConfig['columns'][number]) => {
    const value = item[col.field];
    if (value == null || value === '') return '—';
    if (col.format === 'date') return fmtDate(String(value));
    if (col.format === 'status') return <StatusChip status={String(value)} />;
    return String(value);
  };

  const dialogFields = useMemo(
    () => config.formFields.filter((field) => !patientFilter || field.type !== 'patient'),
    [config.formFields, patientFilter],
  );

  return (
    <Stack spacing={2}>
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff' }}>
        <Typography variant="h5" fontWeight={800}>{t(config.titleKey)}</Typography>
        <Typography sx={{ opacity: 0.95 }}>{branding.tagline_ar}</Typography>
      </Box>
      <PageHeader
        title={t(config.titleKey)}
        subtitle={t(config.subtitleKey)}
        action={(
          <Button variant="contained" onClick={() => setOpen(true)}>
            {t(config.newKey)}
          </Button>
        )}
      />
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              {config.columns.map((col) => (
                <TableCell key={col.field}>{t(col.labelKey)}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={Math.max(config.columns.length, 1)}>
                  <EmptyState message={t(config.emptyKey)} />
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={String(item.id)}>
                  {config.columns.map((col) => (
                    <TableCell key={col.field}>{renderCell(item, col)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t(config.newKey)}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {dialogFields.map((field) => {
              if (field.type === 'patient') {
                return (
                  <TextField
                    key={field.name}
                    select
                    fullWidth
                    required={field.required}
                    label={t(field.labelKey)}
                    value={form[field.name] || ''}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  >
                    {patients.map((p) => (
                      <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
                    ))}
                  </TextField>
                );
              }
              if (field.type === 'select') {
                return (
                  <TextField
                    key={field.name}
                    select
                    fullWidth
                    label={t(field.labelKey)}
                    value={form[field.name] || ''}
                    onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  >
                    {(field.options || []).map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>{t(opt.labelKey)}</MenuItem>
                    ))}
                  </TextField>
                );
              }
              return (
                <TextField
                  key={field.name}
                  fullWidth
                  required={field.required}
                  type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                  multiline={field.type === 'textarea'}
                  rows={field.type === 'textarea' ? 3 : undefined}
                  label={t(field.labelKey)}
                  value={form[field.name] || ''}
                  onChange={(e) => setForm({ ...form, [field.name]: e.target.value })}
                  InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                />
              );
            })}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={create}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
