import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import StatusChip from '@/shared/components/StatusChip';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface FileAsset {
  id: string;
  original_name: string;
  category: string;
  visibility: string;
  size_bytes: number;
  created_at: string;
}

interface Patient { id: string; full_name: string }

export default function FilesPage() {
  const { t } = useTranslation();
  const [files, setFiles] = useState<FileAsset[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({ patient: '', category: 'report', description: '', visibility: 'private' });

  const load = useCallback(() => {
    apiClient.get('/staff/files/').then((res) => setFiles(unwrapList(res.data)));
  }, []);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((res) => setPatients(unwrapList(res.data)));
  }, [load]);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !form.patient) return;
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    fd.append('patient', form.patient);
    fd.append('category', form.category);
    fd.append('description', form.description);
    fd.append('visibility', form.visibility);
    await apiClient.post('/staff/files/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    load();
  };

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.files')} subtitle={t('files.subtitle')} />
      <Paper sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="flex-end">
          <TextField select label={t('patients.name')} value={form.patient}
            onChange={(e) => setForm({ ...form, patient: e.target.value })} sx={{ minWidth: 200 }}>
            {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
          </TextField>
          <TextField select label={t('files.category')} value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })} sx={{ minWidth: 160 }}>
            <MenuItem value="report">{t('files.categories.report')}</MenuItem>
            <MenuItem value="lab">{t('files.categories.lab')}</MenuItem>
            <MenuItem value="imaging">{t('files.categories.imaging')}</MenuItem>
          </TextField>
          <TextField label={t('files.description')} value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })} sx={{ flex: 1 }} />
          <Button variant="contained" component="label" disabled={!form.patient}>
            {t('files.upload')}
            <input type="file" hidden onChange={upload} />
          </Button>
        </Stack>
      </Paper>
      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('files.name')}</TableCell>
              <TableCell>{t('files.category')}</TableCell>
              <TableCell>{t('files.visibility')}</TableCell>
              <TableCell>{t('files.size')}</TableCell>
              <TableCell>{t('prescriptions.date')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {files.length === 0 ? (
              <TableRow><TableCell colSpan={5}><EmptyState message={t('files.empty')} /></TableCell></TableRow>
            ) : files.map((f) => (
              <TableRow key={f.id}>
                <TableCell>{f.original_name}</TableCell>
                <TableCell>{f.category}</TableCell>
                <TableCell><StatusChip status={f.visibility} namespace="files.visibilityOptions" /></TableCell>
                <TableCell>{Math.round(f.size_bytes / 1024)} KB</TableCell>
                <TableCell>{fmtDateTime(f.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Stack>
  );
}
