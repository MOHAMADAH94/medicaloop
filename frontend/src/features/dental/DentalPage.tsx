import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { apiClient } from '@/shared/api/client';
import EmptyState from '@/shared/components/EmptyState';
import StatusChip from '@/shared/components/StatusChip';
import OdontogramChart from '@/features/dental/OdontogramChart';
import { DENTAL_PROCEDURES } from '@/features/dental/dentalProcedures';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface Patient { id: string; full_name: string }
interface Treatment {
  id: string;
  patient: string;
  patient_name: string;
  treatment_date: string;
  tooth_number: string;
  procedure: string;
  status: string;
  notes?: string;
}

const STATUS_TABS = ['all', 'planned', 'in_progress', 'completed'] as const;

export default function DentalPage() {
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [params] = useSearchParams();
  const patientFilter = params.get('patient');
  const [items, setItems] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient: patientFilter || '',
    treatment_date: new Date().toISOString().slice(0, 10),
    tooth_number: '',
    procedure: '',
    status: 'planned',
    notes: '',
  });

  const load = useCallback(() => {
    const q: Record<string, string> = {};
    const pid = selectedPatient?.id || patientFilter;
    if (pid) q.patient = pid;
    apiClient.get('/staff/dental/treatments/', { params: q }).then((r) => setItems(unwrapList(r.data)));
  }, [selectedPatient, patientFilter]);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((r) => {
      const list = unwrapList(r.data) as Patient[];
      setPatients(list);
      if (patientFilter) {
        setSelectedPatient(list.find((p) => p.id === patientFilter) || null);
      }
    });
  }, [load, patientFilter]);

  const filtered = useMemo(() => {
    const status = STATUS_TABS[tab];
    if (status === 'all') return items;
    return items.filter((i) => i.status === status);
  }, [items, tab]);

  const stats = useMemo(() => ({
    planned: items.filter((i) => i.status === 'planned').length,
    inProgress: items.filter((i) => i.status === 'in_progress').length,
    completed: items.filter((i) => i.status === 'completed').length,
  }), [items]);

  const openForTooth = (tooth: string, procedure?: string, status?: string) => {
    setForm((f) => ({
      ...f,
      tooth_number: tooth,
      procedure: procedure || f.procedure,
      status: status || f.status,
      patient: selectedPatient?.id || patientFilter || f.patient,
    }));
    setOpen(true);
  };

  const create = async () => {
    await apiClient.post('/staff/dental/treatments/', form);
    setOpen(false);
    setForm((f) => ({ ...f, procedure: '', tooth_number: '', notes: '' }));
    load();
  };

  return (
    <Stack spacing={2.5}>
      {/* Hero bar */}
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff', boxShadow: '0 8px 32px rgba(0,131,143,0.25)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{t('dental.workspaceTitle')}</Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>{branding.tagline_ar}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${stats.planned} ${t('dental.statusPlanned')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.inProgress} ${t('dental.statusInProgress')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.completed} ${t('dental.statusCompleted')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        {/* Left — odontogram workspace */}
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" gutterBottom fontWeight={700}>{t('dental.selectPatient')}</Typography>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => p.full_name}
                value={selectedPatient}
                onChange={(_, v) => {
                  setSelectedPatient(v);
                  if (v) setForm((f) => ({ ...f, patient: v.id }));
                }}
                renderInput={(params) => <TextField {...params} placeholder={t('dental.allPatients')} size="small" />}
              />
            </Paper>

            <OdontogramChart
              selected={form.tooth_number}
              treatments={items}
              onSelect={(tooth) => openForTooth(tooth)}
            />

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('dental.quickProcedures')}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {DENTAL_PROCEDURES.map((proc) => (
                  <Chip
                    key={proc.id}
                    label={proc.label}
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={() => openForTooth(form.tooth_number || '11', proc.label, proc.defaultStatus)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right — treatment list */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', minHeight: 480 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1.5 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
                <Tab label={t('dental.tabAll')} />
                <Tab label={t('dental.statusPlanned')} />
                <Tab label={t('dental.statusInProgress')} />
                <Tab label={t('dental.statusCompleted')} />
              </Tabs>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mb: 1 }}>
                {t('dental.newTreatment')}
              </Button>
            </Stack>

            <Box sx={{ p: 2, maxHeight: 520, overflow: 'auto' }}>
              {filtered.length === 0 ? (
                <EmptyState message={t('dental.empty')} />
              ) : (
                <Stack spacing={1.5}>
                  {filtered.map((item) => (
                    <Card key={item.id} variant="outlined" sx={{ borderRadius: 2, '&:hover': { borderColor: 'primary.main', boxShadow: 1 } }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography fontWeight={700}>{item.patient_name}</Typography>
                              {item.tooth_number && (
                                <Chip label={`#${item.tooth_number}`} size="small" color="primary" variant="filled" />
                              )}
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {item.procedure} — {fmtDate(item.treatment_date)}
                            </Typography>
                          </Box>
                          <StatusChip status={item.status} />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('dental.newTreatment')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {!patientFilter && !selectedPatient && (
                  <TextField select fullWidth label={t('patients.name')} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                    {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
                  </TextField>
                )}
                <TextField type="date" fullWidth label={t('dental.treatmentDate')} InputLabelProps={{ shrink: true }} value={form.treatment_date} onChange={(e) => setForm({ ...form, treatment_date: e.target.value })} />
                <TextField fullWidth required label={t('dental.procedure')} value={form.procedure} onChange={(e) => setForm({ ...form, procedure: e.target.value })} />
                <TextField select fullWidth label={t('appointments.status')} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="planned">{t('dental.statusPlanned')}</MenuItem>
                  <MenuItem value="in_progress">{t('dental.statusInProgress')}</MenuItem>
                  <MenuItem value="completed">{t('dental.statusCompleted')}</MenuItem>
                </TextField>
                <TextField fullWidth multiline rows={2} label={t('common.notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>{t('dental.pickTooth')}</Typography>
              <OdontogramChart
                selected={form.tooth_number}
                treatments={items}
                onSelect={(tooth) => setForm({ ...form, tooth_number: tooth })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={create} disabled={!form.procedure || (!form.patient && !patientFilter && !selectedPatient)}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
