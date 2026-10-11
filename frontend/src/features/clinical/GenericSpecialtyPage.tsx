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
import type { SpecialtyCatalogEntry } from '@/shared/config/specialtyCatalog';
import ClinicalVisualChart from '@/features/clinical/ClinicalVisualChart';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface Patient { id: string; full_name: string }
interface ClinicalRecord {
  id: string;
  patient_name: string;
  record_date: string;
  title: string;
  diagnosis: string;
  status: string;
  findings?: string;
  treatment_plan?: string;
}

const STATUS_TABS = ['all', 'active', 'follow_up', 'completed'] as const;

interface Props {
  config: SpecialtyCatalogEntry;
}

export default function GenericSpecialtyPage({ config }: Props) {
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [params] = useSearchParams();
  const patientFilter = params.get('patient');
  const [items, setItems] = useState<ClinicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');
  const [form, setForm] = useState({
    patient: patientFilter || '',
    record_date: new Date().toISOString().slice(0, 10),
    title: '',
    diagnosis: '',
    findings: '',
    treatment_plan: '',
    status: 'active',
    notes: '',
  });

  const load = useCallback(() => {
    const q: Record<string, string> = {};
    const pid = selectedPatient?.id || patientFilter;
    if (pid) q.patient = pid;
    apiClient.get(config.apiPath, { params: q }).then((r) => setItems(unwrapList(r.data)));
  }, [config.apiPath, selectedPatient, patientFilter]);

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
    follow: items.filter((i) => i.status === 'follow_up').length,
    done: items.filter((i) => i.status === 'completed').length,
  }), [items]);

  const openWithTemplate = (title: string, zone?: string) => {
    setForm((f) => ({
      ...f,
      title,
      findings: zone ? `${zone}: ` : f.findings,
      patient: selectedPatient?.id || patientFilter || f.patient,
    }));
    if (zone) setSelectedZone(zone);
    setOpen(true);
  };

  const create = async () => {
    await apiClient.post(config.apiPath, form);
    setOpen(false);
    setForm((f) => ({ ...f, title: '', diagnosis: '', findings: '', treatment_plan: '', notes: '' }));
    load();
  };

  const quickTemplates = useMemo(() => {
    const key = config.code;
    const templates: Record<string, string[]> = {
      cardiology: ['كشف قلب', 'متابعة ECG', 'مراجعة ضغط'],
      ophthalmology: ['فحص نظر', 'قياس ضغط العين', 'وصف نظارات'],
      orthopedics: ['إصابة حادة', 'كسر عظم', 'ألم مفصل'],
      ent: ['التهاب أذن', 'التهاب حلق', 'حساسية أنف'],
      psychiatry: ['جلسة أولى', 'متابعة دواء', 'CBT'],
      gastroenterology: ['ألم بطن', 'GERD', 'متابعة IBD'],
      neurology: ['صداع', 'دوخة', 'مراجعة MRI'],
      pulmonology: ['ربo', 'سعال مزمن', 'Spirometry'],
      urology: ['UTI', 'متابعة PSA', 'حصوات'],
      endocrinology: ['متابعة سكري', 'Thyroid', 'HbA1c'],
      nutrition: ['تقييم تغذية', 'خطة غذائية', 'متابعة وزن'],
      physiotherapy: ['تقييم حركي', 'جلسة علاج', 'تأهيل'],
    };
    return templates[key] || ['كشف أولي', 'متابعة', 'مراجعة'];
  }, [config.code]);

  return (
    <Stack spacing={2.5}>
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ opacity: 0.95, display: 'flex' }}>{config.icon}</Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>{t(config.titleKey)}</Typography>
              <Typography sx={{ opacity: 0.92 }}>{branding.tagline_ar}</Typography>
            </Box>
          </Box>
          <Stack direction="row" spacing={1}>
            <Chip label={`${stats.active} ${t('clinical.statActive')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
            <Chip label={`${stats.follow} ${t('clinical.statFollowUp')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
            <Chip label={`${stats.done} ${t('clinical.statCompleted')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff' }} />
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('clinical.selectPatient')}</Typography>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => p.full_name}
                value={selectedPatient}
                onChange={(_, v) => { setSelectedPatient(v); if (v) setForm((f) => ({ ...f, patient: v.id })); }}
                renderInput={(p) => <TextField {...p} size="small" placeholder={t('clinical.allPatients')} />}
              />
            </Paper>

            <ClinicalVisualChart
              code={config.code}
              selected={selectedZone}
              onSelect={(_zone, label) => openWithTemplate(form.title || t(config.newKey), label)}
            />

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('clinical.quickTemplates')}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {quickTemplates.map((tpl) => (
                  <Chip
                    key={tpl}
                    label={tpl}
                    clickable
                    variant="outlined"
                    color="primary"
                    onClick={() => openWithTemplate(tpl)}
                  />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ borderRadius: 3, minHeight: 480, overflow: 'hidden' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
                <Tab label={t('clinical.tabAll')} />
                <Tab label={t('clinical.tabActive')} />
                <Tab label={t('clinical.tabFollowUp')} />
                <Tab label={t('clinical.tabCompleted')} />
              </Tabs>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mb: 1 }}>
                {t(config.newKey)}
              </Button>
            </Stack>
            <Box sx={{ p: 2 }}>
              {filtered.length === 0 ? (
                <EmptyState message={t(config.emptyKey)} />
              ) : (
                <Stack spacing={1.5}>
                  {filtered.map((item) => (
                    <Card key={item.id} variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between">
                          <Box>
                            <Typography fontWeight={700}>{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.patient_name} — {item.diagnosis || fmtDate(item.record_date)}
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
        <DialogTitle fontWeight={700}>{t(config.newKey)}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                {!patientFilter && !selectedPatient && (
                  <TextField select fullWidth label={t('patients.name')} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })}>
                    {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
                  </TextField>
                )}
                <TextField fullWidth required label={t('clinical.recordTitle')} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <TextField type="date" fullWidth label={t('clinical.recordDate')} InputLabelProps={{ shrink: true }} value={form.record_date} onChange={(e) => setForm({ ...form, record_date: e.target.value })} />
                <TextField fullWidth label={t('clinical.diagnosis')} value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} />
                <TextField fullWidth multiline rows={2} label={t('clinical.findings')} value={form.findings} onChange={(e) => setForm({ ...form, findings: e.target.value })} />
                <TextField select fullWidth label={t('appointments.status')} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  <MenuItem value="active">{t('clinical.statusActive')}</MenuItem>
                  <MenuItem value="follow_up">{t('clinical.statusFollowUp')}</MenuItem>
                  <MenuItem value="completed">{t('clinical.statusCompleted')}</MenuItem>
                  <MenuItem value="on_hold">{t('clinical.statusOnHold')}</MenuItem>
                </TextField>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <ClinicalVisualChart
                code={config.code}
                selected={selectedZone}
                onSelect={(zone, label) => {
                  setSelectedZone(zone);
                  setForm((f) => {
                    const rest = f.findings.replace(/^\[.*?\]\s*/, '');
                    return { ...f, findings: `[${label}] ${rest}`.trim() };
                  });
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={create}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
