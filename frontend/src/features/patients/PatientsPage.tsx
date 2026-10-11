import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import LoadingBox from '@/shared/components/LoadingBox';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { useToast } from '@/shared/feedback/ToastProvider';
import { usePermissions } from '@/shared/auth/PermissionsProvider';
import { unwrapList } from '@/shared/utils/api';
import { extractApiError } from '@/shared/utils/errors';

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
}

const EMPTY_FORM = { first_name: '', last_name: '', phone: '', email: '' };

export default function PatientsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { can } = usePermissions();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pendingDelete, setPendingDelete] = useState<Patient | null>(null);
  const [busy, setBusy] = useState(false);

  const canCreate = can('patients.create');
  const canEdit = can('patients.edit');

  const load = useCallback(() => {
    setLoading(true);
    apiClient
      .get('/staff/patients/')
      .then((res) => setPatients(unwrapList(res.data)))
      .catch((err) => toast.error(extractApiError(err, t('common.error'))))
      .finally(() => setLoading(false));
  }, [toast, t]);

  useEffect(load, [load]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return patients;
    return patients.filter((p) =>
      [p.full_name, p.phone, p.email].some((field) => field?.toLowerCase().includes(term)));
  }, [patients, search]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (patient: Patient) => {
    setEditing(patient);
    setForm({
      first_name: patient.first_name ?? '',
      last_name: patient.last_name ?? '',
      phone: patient.phone ?? '',
      email: patient.email ?? '',
    });
    setDialogOpen(true);
  };

  const save = async () => {
    setBusy(true);
    try {
      if (editing) {
        await apiClient.patch(`/staff/patients/${editing.id}/`, form);
      } else {
        await apiClient.post('/staff/patients/', form);
      }
      toast.success(t('common.saved'));
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('common.error')));
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await apiClient.delete(`/staff/patients/${pendingDelete.id}/`);
      toast.success(t('patients.unlinked'));
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('common.error')));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t('nav.patients')}
        subtitle={t('patients.subtitle')}
        action={canCreate ? (
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={openCreate}>
            {t('patients.add')}
          </Button>
        ) : undefined}
      />

      <TextField
        size="small"
        placeholder={t('patients.search')}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ maxWidth: 360 }}
        InputProps={{
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
        }}
      />

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? <LoadingBox /> : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('patients.name')}</TableCell>
                <TableCell>{t('patients.phone')}</TableCell>
                <TableCell>{t('auth.emailOptional')}</TableCell>
                <TableCell align="center">{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}><EmptyState message={t('patients.empty')} /></TableCell>
                </TableRow>
              ) : filtered.map((p) => (
                <TableRow key={p.id} hover>
                  <TableCell>{p.full_name}</TableCell>
                  <TableCell>{p.phone || '—'}</TableCell>
                  <TableCell>{p.email || '—'}</TableCell>
                  <TableCell align="center">
                    <Tooltip title={t('patients.viewRecord')}>
                      <IconButton component={RouterLink} to={`/dashboard/patients/${p.id}`} color="primary">
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {canEdit && (
                      <>
                        <Tooltip title={t('common.edit')}>
                          <IconButton onClick={() => openEdit(p)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('patients.unlink')}>
                          <IconButton color="error" onClick={() => setPendingDelete(p)}>
                            <DeleteOutlineIcon />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle fontWeight={700}>
          {editing ? t('patients.editPatient') : t('patients.add')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField required label={t('auth.firstName')} value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} fullWidth />
            <TextField required label={t('auth.lastName')} value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })} fullWidth />
            <TextField label={t('patients.phone')} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField label={t('auth.emailOptional')} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={save} disabled={busy || !form.first_name || !form.last_name}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('patients.unlink')}
        message={t('patients.unlinkConfirm', { name: pendingDelete?.full_name })}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  );
}
