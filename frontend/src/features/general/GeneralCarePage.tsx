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
import CarePlanWheel, { CARE_DOMAINS } from '@/features/general/CarePlanWheel';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface Patient { id: string; full_name: string }
interface CarePlan {
  id: string;
  patient_name: string;
  title: string;
  condition: string;
  care_plan: string;
  status: string;
  start_date: string;
  review_date?: string;
}

const STATUS_TABS = ['all', 'active', 'on_hold', 'completed'] as const;

export default function GeneralCarePage() {
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [params] = useSearchParams();
  const patientFilter = params.get('patient');
  const [items, setItems] = useState<CarePlan[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [form, setForm] = useState({
    patient: patientFilter || '',
    title: '',
    condition: '',
    care_plan: '',
    status: 'active',
    start_date: new Date().toISOString().slice(0, 10),
    review_date: '',
    notes: '',
  });

  const load = useCallback(() => {
    const q: Record<string, string> = {};
    const pid = selectedPatient?.id || patientFilter;
    if (pid) q.patient = pid;
    apiClient.get('/staff/general/care-plans/', { params: q }).then((r) => setItems(unwrapList(r.data)));
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
    hold: items.filter((i) => i.status === 'on_hold').length,
    done: items.filter((i) => i.status === 'completed').length,
  }), [items]);

  const openForDomain = (domainId: string) => {
    const domain = CARE_DOMAINS.find((d) => d.id === domainId);
    setSelectedDomain(domainId);
    setForm((f) => ({
      ...f,
      condition: domain ? t(domain.labelKey) : f.condition,
      patient: selectedPatient?.id || patientFilter || f.patient,
    }));
    setOpen(true);
  };

  const create = async () => {
    const payload = { ...form, review_date: form.review_date || null };
    await apiClient.post('/staff/general/care-plans/', payload);
    setOpen(false);
    setForm((f) => ({ ...f, title: '', condition: '', care_plan: '', notes: '', review_date: '' }));
    load();
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff', boxShadow: '0 8px 32px rgba(21,101,192,0.2)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{t('generalCare.workspaceTitle')}</Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>{branding.tagline_ar}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${stats.active} ${t('generalCare.activePlans')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.hold} ${t('generalCare.onHoldPlans')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.done} ${t('generalCare.completedPlans')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('generalCare.selectPatient')}</Typography>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => p.full_name}
                value={selectedPatient}
                onChange={(_, v) => { setSelectedPatient(v); if (v) setForm((f) => ({ ...f, patient: v.id })); }}
                renderInput={(p) => <TextField {...p} size="small" placeholder={t('generalCare.allPatients')} />}
              />
            </Paper>

            <CarePlanWheel
              selected={selectedDomain}
              onSelect={openForDomain}
              activeDomains={items.filter((i) => i.status === 'active').map((i) => i.condition).slice(0, 5)}
            />

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('generalCare.quickPlans')}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[t('generalCare.quickChronic'), t('generalCare.quickPreventive'), t('generalCare.quickPostOp')].map((label) => (
                  <Chip
                    key={label}
                    label={label}
                    clickable
                    color="primary"
                    variant="outlined"
                    onClick={() => { setForm((f) => ({ ...f, title: label })); setOpen(true); }}
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
                <Tab label={t('generalCare.tabAll')} />
                <Tab label={t('clinical.statusActive')} />
                <Tab label={t('clinical.statusOnHold')} />
                <Tab label={t('clinical.statusCompleted')} />
              </Tabs>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mb: 1 }}>
                {t('generalCare.newPlan')}
              </Button>
            </Stack>
            <Box sx={{ p: 2, maxHeight: 520, overflow: 'auto' }}>
              {filtered.length === 0 ? (
                <EmptyState message={t('generalCare.empty')} />
              ) : (
                <Stack spacing={1.5}>
                  {filtered.map((item) => (
                    <Card key={item.id} variant="outlined" sx={{ borderRadius: 2, '&:hover': { borderColor: 'primary.main', boxShadow: 1 } }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Box>
                            <Typography fontWeight={700}>{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.patient_name} — {item.condition || fmtDate(item.start_date)}
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
        <DialogTitle sx={{ fontWeight: 700 }}>{t('generalCare.newPlan')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {!patientFilter && !selectedPatient && (
                  <TextField select fullWidth label={t('patients.name')} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                    {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
                  </TextField>
                )}
                <TextField fullWidth required label={t('generalCare.planTitle')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <TextField fullWidth label={t('generalCare.condition')} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
                <TextField type="date" fullWidth label={t('generalCare.startDate')} InputLabelProps={{ shrink: true }} value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                <TextField fullWidth multiline rows={3} label={t('generalCare.carePlan')} value={form.care_plan} onChange={(e) => setForm({ ...form, care_plan: e.target.value })} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <CarePlanWheel selected={selectedDomain} onSelect={(id) => { setSelectedDomain(id); const d = CARE_DOMAINS.find((x) => x.id === id); if (d) setForm((f) => ({ ...f, condition: t(d.labelKey) })); }} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={create} disabled={!form.title || (!form.patient && !patientFilter && !selectedPatient)}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
