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
import GrowthChart from '@/features/pediatrics/GrowthChart';
import ImmunizationTimeline, { COMMON_VACCINES } from '@/features/pediatrics/ImmunizationTimeline';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface Patient { id: string; full_name: string }
interface Growth {
  id: string;
  patient_name: string;
  record_date: string;
  age_months?: number;
  weight_kg?: string;
  height_cm?: string;
  head_circumference_cm?: string;
}
interface Vaccine {
  id: string;
  patient_name: string;
  vaccine_name: string;
  dose_number: number;
  scheduled_date?: string;
  given_date?: string;
  status: string;
}

export default function PediatricsPage() {
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [params] = useSearchParams();
  const patientFilter = params.get('patient');
  const initialTab = params.get('tab') === 'vaccines' ? 1 : 0;
  const [mainTab, setMainTab] = useState(initialTab);
  const [growth, setGrowth] = useState<Growth[]>([]);
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [openGrowth, setOpenGrowth] = useState(false);
  const [openVaccine, setOpenVaccine] = useState(false);
  const [gForm, setGForm] = useState({
    patient: patientFilter || '',
    record_date: new Date().toISOString().slice(0, 10),
    age_months: '',
    weight_kg: '',
    height_cm: '',
    head_circumference_cm: '',
    notes: '',
  });
  const [vForm, setVForm] = useState({
    patient: patientFilter || '',
    vaccine_name: 'MMR',
    dose_number: '1',
    scheduled_date: new Date().toISOString().slice(0, 10),
    given_date: '',
    status: 'due',
    notes: '',
  });

  const load = useCallback(() => {
    const q: Record<string, string> = {};
    const pid = selectedPatient?.id || patientFilter;
    if (pid) q.patient = pid;
    apiClient.get('/staff/pediatrics/growth-records/', { params: q }).then((r) => setGrowth(unwrapList(r.data)));
    apiClient.get('/staff/pediatrics/immunizations/', { params: q }).then((r) => setVaccines(unwrapList(r.data)));
  }, [selectedPatient, patientFilter]);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((r) => {
      const list = unwrapList(r.data) as Patient[];
      setPatients(list);
      if (patientFilter) setSelectedPatient(list.find((p) => p.id === patientFilter) || null);
    });
  }, [load, patientFilter]);

  const dueCount = useMemo(() => vaccines.filter((v) => v.status === 'due' || v.status === 'overdue').length, [vaccines]);

  const saveGrowth = async () => {
    const payload: Record<string, unknown> = { ...gForm };
    ['age_months', 'weight_kg', 'height_cm', 'head_circumference_cm'].forEach((k) => {
      if (payload[k] === '') delete payload[k];
      else if (typeof payload[k] === 'string') payload[k] = Number(payload[k]);
    });
    await apiClient.post('/staff/pediatrics/growth-records/', payload);
    setOpenGrowth(false);
    load();
  };

  const saveVaccine = async () => {
    await apiClient.post('/staff/pediatrics/immunizations/', {
      ...vForm,
      dose_number: Number(vForm.dose_number) || 1,
      given_date: vForm.given_date || null,
    });
    setOpenVaccine(false);
    load();
  };

  const openVaccineQuick = (name: string) => {
    setVForm((f) => ({
      ...f,
      vaccine_name: name,
      patient: selectedPatient?.id || patientFilter || f.patient,
    }));
    setOpenVaccine(true);
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff', boxShadow: '0 8px 32px rgba(0,105,92,0.2)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{t('pediatrics.workspaceTitle')}</Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>{branding.tagline_ar}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${growth.length} ${t('pediatrics.growthCount')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${dueCount} ${t('pediatrics.dueVaccines')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('pediatrics.selectPatient')}</Typography>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => p.full_name}
                value={selectedPatient}
                onChange={(_, v) => { setSelectedPatient(v); if (v) { setGForm((f) => ({ ...f, patient: v.id })); setVForm((f) => ({ ...f, patient: v.id })); } }}
                renderInput={(p) => <TextField {...p} size="small" placeholder={t('pediatrics.allPatients')} />}
              />
            </Paper>

            <GrowthChart records={growth} />

            <ImmunizationTimeline vaccines={vaccines} onSelect={openVaccineQuick} />

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('pediatrics.quickVaccines')}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {COMMON_VACCINES.map((v) => (
                  <Chip key={v} label={v} clickable color="primary" variant="outlined" onClick={() => openVaccineQuick(v)} sx={{ fontWeight: 600 }} />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', minHeight: 480 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1.5 }}>
              <Tabs value={mainTab} onChange={(_, v) => setMainTab(v)}>
                <Tab label={t('pediatrics.growthTab')} />
                <Tab label={t('pediatrics.vaccinesTab')} />
              </Tabs>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => (mainTab === 0 ? setOpenGrowth(true) : setOpenVaccine(true))}
                sx={{ mb: 1 }}
              >
                {mainTab === 0 ? t('pediatrics.newRecord') : t('pediatrics.newVaccine')}
              </Button>
            </Stack>
            <Box sx={{ p: 2, maxHeight: 520, overflow: 'auto' }}>
              {mainTab === 0 ? (
                growth.length === 0 ? (
                  <EmptyState message={t('pediatrics.empty')} />
                ) : (
                  <Stack spacing={1.5}>
                    {growth.map((g) => (
                      <Card key={g.id} variant="outlined" sx={{ borderRadius: 2, '&:hover': { borderColor: 'primary.main', boxShadow: 1 } }}>
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" justifyContent="space-between">
                            <Box>
                              <Typography fontWeight={700}>{g.patient_name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {fmtDate(g.record_date)} — {g.age_months != null ? `${g.age_months} ${t('pediatrics.ageMonths')}` : ''}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                              {g.weight_kg && <Chip size="small" label={`${g.weight_kg} kg`} />}
                              {g.height_cm && <Chip size="small" label={`${g.height_cm} cm`} />}
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                )
              ) : vaccines.length === 0 ? (
                <EmptyState message={t('pediatrics.emptyVaccines')} />
              ) : (
                <Stack spacing={1.5}>
                  {vaccines.map((v) => (
                    <Card key={v.id} variant="outlined" sx={{ borderRadius: 2, '&:hover': { borderColor: 'primary.main', boxShadow: 1 } }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Box>
                            <Typography fontWeight={700}>{v.patient_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {v.vaccine_name} — {t('pediatrics.dose')} {v.dose_number}
                              {v.scheduled_date ? ` — ${fmtDate(v.scheduled_date)}` : ''}
                            </Typography>
                          </Box>
                          <StatusChip status={v.status} />
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

      <Dialog open={openGrowth} onClose={() => setOpenGrowth(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('pediatrics.newRecord')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!patientFilter && !selectedPatient && (
              <TextField select label={t('patients.name')} value={gForm.patient} onChange={(e) => setGForm({ ...gForm, patient: e.target.value })} fullWidth>
                {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
              </TextField>
            )}
            <TextField type="date" label={t('pediatrics.recordDate')} InputLabelProps={{ shrink: true }} value={gForm.record_date} onChange={(e) => setGForm({ ...gForm, record_date: e.target.value })} fullWidth />
            <TextField type="number" label={t('pediatrics.ageMonths')} value={gForm.age_months} onChange={(e) => setGForm({ ...gForm, age_months: e.target.value })} fullWidth />
            <TextField type="number" label={t('pediatrics.weight')} value={gForm.weight_kg} onChange={(e) => setGForm({ ...gForm, weight_kg: e.target.value })} fullWidth />
            <TextField type="number" label={t('pediatrics.height')} value={gForm.height_cm} onChange={(e) => setGForm({ ...gForm, height_cm: e.target.value })} fullWidth />
            <TextField type="number" label={t('pediatrics.headCircumference')} value={gForm.head_circumference_cm} onChange={(e) => setGForm({ ...gForm, head_circumference_cm: e.target.value })} fullWidth />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGrowth(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={saveGrowth}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVaccine} onClose={() => setOpenVaccine(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('pediatrics.newVaccine')}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            {!patientFilter && !selectedPatient && (
              <TextField select label={t('patients.name')} value={vForm.patient} onChange={(e) => setVForm({ ...vForm, patient: e.target.value })} fullWidth>
                {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
              </TextField>
            )}
            <TextField select label={t('pediatrics.vaccine')} value={vForm.vaccine_name} onChange={(e) => setVForm({ ...vForm, vaccine_name: e.target.value })} fullWidth>
              {COMMON_VACCINES.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
            </TextField>
            <TextField type="number" label={t('pediatrics.dose')} value={vForm.dose_number} onChange={(e) => setVForm({ ...vForm, dose_number: e.target.value })} fullWidth />
            <TextField type="date" label={t('pediatrics.scheduled')} InputLabelProps={{ shrink: true }} value={vForm.scheduled_date} onChange={(e) => setVForm({ ...vForm, scheduled_date: e.target.value })} fullWidth />
            <TextField select label={t('appointments.status')} value={vForm.status} onChange={(e) => setVForm({ ...vForm, status: e.target.value })} fullWidth>
              <MenuItem value="due">{t('pediatrics.statusDue')}</MenuItem>
              <MenuItem value="given">{t('pediatrics.statusGiven')}</MenuItem>
              <MenuItem value="overdue">{t('pediatrics.statusOverdue')}</MenuItem>
              <MenuItem value="skipped">{t('pediatrics.statusSkipped')}</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVaccine(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={saveVaccine}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
