import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';

interface Appointment {
  id: string;
  patient: string;
  patient_name: string;
  scheduled_start: string;
  status: string;
}

interface Patient {
  id: string;
  full_name: string;
}

const STATUS_COLOR: Record<string, 'default' | 'warning' | 'success' | 'error' | 'info'> = {
  pending: 'warning',
  confirmed: 'success',
  cancelled: 'error',
  completed: 'info',
};

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patient: '', scheduled_start: '' });

  const load = useCallback(() => {
    const params = tab === 0 ? {} : tab === 1 ? { status: 'pending' } : {};
    const url = tab === 0 ? '/staff/appointments/today/' : '/staff/appointments/';
    apiClient.get(url, { params }).then((res) => {
      setAppointments(Array.isArray(res.data) ? res.data : res.data.results || []);
    });
  }, [tab]);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((res) => {
      setPatients(res.data.results || res.data);
    });
  }, [load]);

  const handleConfirm = async (id: string) => {
    await apiClient.post(`/staff/appointments/${id}/confirm/`);
    load();
  };

  const handleCancel = async (id: string) => {
    await apiClient.post(`/staff/appointments/${id}/cancel/`, { reason: 'Cancelled by clinic' });
    load();
  };

  const handleCreate = async () => {
    await apiClient.post('/staff/appointments/', {
      patient: form.patient,
      scheduled_start: new Date(form.scheduled_start).toISOString(),
    });
    setOpen(false);
    setForm({ patient: '', scheduled_start: '' });
    load();
  };

  const handleStartVisit = async (appointmentId: string) => {
    const { data } = await apiClient.post('/staff/visits/start_from_appointment/', { appointment_id: appointmentId });
    navigate(`/dashboard/visits/${data.id}`);
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">{t('nav.appointments')}</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>{t('appointments.new')}</Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={t('appointments.today')} />
        <Tab label={t('appointments.pending')} />
        <Tab label={t('appointments.all')} />
      </Tabs>

      <Paper>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('patients.name')}</TableCell>
              <TableCell>{t('appointments.time')}</TableCell>
              <TableCell>{t('appointments.status')}</TableCell>
              <TableCell align="left">{t('appointments.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">{t('appointments.empty')}</TableCell>
              </TableRow>
            ) : (
              appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.patient_name}</TableCell>
                  <TableCell>{new Date(a.scheduled_start).toLocaleString('ar-SA')}</TableCell>
                  <TableCell>
                    <Chip label={t(`appointments.statuses.${a.status}`, a.status)} color={STATUS_COLOR[a.status] || 'default'} size="small" />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {a.status === 'pending' && (
                        <Button size="small" variant="contained" onClick={() => handleConfirm(a.id)}>
                          {t('appointments.confirm')}
                        </Button>
                      )}
                      {['pending', 'confirmed'].includes(a.status) && (
                        <Button size="small" color="error" onClick={() => handleCancel(a.id)}>
                          {t('appointments.cancel')}
                        </Button>
                      )}
                      {a.status === 'confirmed' && (
                        <Button size="small" variant="outlined" onClick={() => handleStartVisit(a.id)}>
                          {t('visits.start')}
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('appointments.new')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField select label={t('patients.name')} value={form.patient}
              onChange={(e) => setForm({ ...form, patient: e.target.value })} fullWidth>
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>
              ))}
            </TextField>
            <TextField type="datetime-local" label={t('appointments.time')} value={form.scheduled_start}
              onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })}
              InputLabelProps={{ shrink: true }} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={handleCreate}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
