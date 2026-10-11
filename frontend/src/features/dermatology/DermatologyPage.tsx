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
import BodyMapChart, { BODY_REGIONS } from '@/features/dermatology/BodyMapChart';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface Patient { id: string; full_name: string }
interface SkinCase {
  id: string;
  patient_name: string;
  case_date: string;
  body_area: string;
  diagnosis: string;
  severity: string;
  status: string;
}

const QUICK_DIAGNOSES = ['أكزيما', 'حب شباب', 'فطريات', 'حساسية', 'صدفية', 'التهاب جلد'];

const STATUS_TABS = ['all', 'active', 'resolved', 'follow_up'] as const;

export default function DermatologyPage() {
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [params] = useSearchParams();
  const patientFilter = params.get('patient');
  const [items, setItems] = useState<SkinCase[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    patient: patientFilter || '',
    case_date: new Date().toISOString().slice(0, 10),
    body_area: BODY_REGIONS[0].label as string,
    diagnosis: '',
    treatment_plan: '',
    severity: 'mild',
    status: 'active',
    notes: '',
  });

  const load = useCallback(() => {
    const q: Record<string, string> = {};
    const pid = selectedPatient?.id || patientFilter;
    if (pid) q.patient = pid;
    apiClient.get('/staff/dermatology/cases/', { params: q }).then((r) => setItems(unwrapList(r.data)));
  }, [selectedPatient, patientFilter]);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((r) => {
      const list = unwrapList(r.data) as Patient[];
      setPatients(list);
      if (patientFilter) setSelectedPatient(list.find((p) => p.id === patientFilter) || null);
    });
  }, [load, patientFilter]);

  const filtered = useMemo(() => {
    const status = STATUS_TABS[tab];
    if (status === 'all') return items;
    return items.filter((i) => i.status === status);
  }, [items, tab]);

  const stats = useMemo(() => ({
    active: items.filter((i) => i.status === 'active').length,
    severe: items.filter((i) => i.severity === 'severe').length,
    resolved: items.filter((i) => i.status === 'resolved').length,
  }), [items]);

  const openForArea = (area: string, diagnosis?: string) => {
    setForm((f) => ({
      ...f,
      body_area: area,
      diagnosis: diagnosis || f.diagnosis,
      patient: selectedPatient?.id || patientFilter || f.patient,
    }));
    setOpen(true);
  };

  const create = async () => {
    await apiClient.post('/staff/dermatology/cases/', form);
    setOpen(false);
    setForm((f) => ({ ...f, diagnosis: '', treatment_plan: '', notes: '' }));
    load();
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff', boxShadow: '0 8px 32px rgba(123,31,162,0.2)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{t('dermatology.workspaceTitle')}</Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>{branding.tagline_ar}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${stats.active} ${t('dermatology.statusActive')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.severe} ${t('dermatology.severitySevere')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.resolved} ${t('dermatology.statusResolved')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('dermatology.selectPatient')}</Typography>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => p.full_name}
                value={selectedPatient}
                onChange={(_, v) => { setSelectedPatient(v); if (v) setForm((f) => ({ ...f, patient: v.id })); }}
                renderInput={(p) => <TextField {...p} size="small" placeholder={t('dermatology.allPatients')} />}
              />
            </Paper>

            <BodyMapChart
              selected={form.body_area}
              cases={items}
              onSelect={(area) => openForArea(area)}
            />

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('dermatology.quickDiagnoses')}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {QUICK_DIAGNOSES.map((dx) => (
                  <Chip
                    key={dx}
                    label={dx}
                    clickable
                    color="secondary"
                    variant="outlined"
                    onClick={() => openForArea(form.body_area, dx)}
                    sx={{ fontWeight: 600 }}
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', minHeight: 480 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1.5 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
                <Tab label={t('dermatology.tabAll')} />
                <Tab label={t('dermatology.statusActive')} />
                <Tab label={t('dermatology.statusResolved')} />
                <Tab label={t('dermatology.statusFollowUp')} />
              </Tabs>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mb: 1 }}>
                {t('dermatology.newCase')}
              </Button>
            </Stack>
            <Box sx={{ p: 2, maxHeight: 520, overflow: 'auto' }}>
              {filtered.length === 0 ? (
                <EmptyState message={t('dermatology.empty')} />
              ) : (
                <Stack spacing={1.5}>
                  {filtered.map((item) => (
                    <Card key={item.id} variant="outlined" sx={{ borderRadius: 2, '&:hover': { borderColor: 'secondary.main', boxShadow: 1 } }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Typography fontWeight={700}>{item.patient_name}</Typography>
                              <Chip label={item.body_area} size="small" color="secondary" variant="filled" />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {item.diagnosis} — {fmtDate(item.case_date)}
                            </Typography>
                          </Box>
                          <Stack spacing={0.5} alignItems="flex-end">
                            <StatusChip status={item.severity} />
                            <StatusChip status={item.status} />
                          </Stack>
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
        <DialogTitle sx={{ fontWeight: 700 }}>{t('dermatology.newCase')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {!patientFilter && !selectedPatient && (
                  <TextField select fullWidth label={t('patients.name')} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                    {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
                  </TextField>
                )}
                <TextField type="date" fullWidth label={t('dermatology.caseDate')} InputLabelProps={{ shrink: true }} value={form.case_date} onChange={(e) => setForm({ ...form, case_date: e.target.value })} />
                <TextField select fullWidth label={t('dermatology.bodyArea')} value={form.body_area} onChange={(e) => setForm({ ...form, body_area: e.target.value })}>
                  {BODY_REGIONS.map((a) => <MenuItem key={a.id} value={a.label}>{a.label}</MenuItem>)}
                </TextField>
                <TextField fullWidth required label={t('dermatology.diagnosis')} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
                <TextField fullWidth multiline rows={2} label={t('dermatology.treatmentPlan')} value={form.treatment_plan} onChange={(e) => setForm({ ...form, treatment_plan: e.target.value })} />
                <TextField select fullWidth label={t('dermatology.severity')} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  <MenuItem value="mild">{t('dermatology.severityMild')}</MenuItem>
                  <MenuItem value="moderate">{t('dermatology.severityModerate')}</MenuItem>
                  <MenuItem value="severe">{t('dermatology.severitySevere')}</MenuItem>
                </TextField>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <BodyMapChart
                selected={form.body_area}
                cases={items}
                onSelect={(area) => setForm({ ...form, body_area: area })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={create} disabled={!form.diagnosis}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
