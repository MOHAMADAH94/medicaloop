import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
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
import PregnancyTimelineChart from '@/features/obgyn/PregnancyTimelineChart';
import { fmtDate } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface Pregnancy {
  id: string;
  patient: string;
  patient_name?: string;
  lmp_date: string;
  edd_date: string;
  status: string;
  risk_level: string;
}

interface Patient { id: string; full_name: string }

const STATUS_TABS = ['all', 'active', 'delivered', 'terminated'] as const;

function estimateGA(lmp: string): { weeks: number; days: number } | null {
  if (!lmp) return null;
  const start = new Date(lmp);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  if (diff < 0) return null;
  const totalDays = Math.floor(diff / (1000 * 60 * 60 * 24));
  return { weeks: Math.floor(totalDays / 7), days: totalDays % 7 };
}

export default function PregnanciesPage() {
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [params] = useSearchParams();
  const patientFilter = params.get('patient');
  const [items, setItems] = useState<Pregnancy[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [highlighted, setHighlighted] = useState<Pregnancy | null>(null);
  const [tab, setTab] = useState(0);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ patient: patientFilter || '', lmp_date: '', notes: '' });

  const load = useCallback(() => {
    const q: Record<string, string> = {};
    const pid = selectedPatient?.id || patientFilter;
    if (pid) q.patient = pid;
    apiClient.get('/staff/obgyn/pregnancies/', { params: q }).then((res) => setItems(unwrapList(res.data)));
  }, [selectedPatient, patientFilter]);

  useEffect(() => {
    load();
    apiClient.get('/staff/patients/').then((r) => {
      const list = unwrapList(r.data) as Patient[];
      setPatients(list);
      if (patientFilter) setSelectedPatient(list.find((p) => p.id === patientFilter) || null);
    });
  }, [load, patientFilter]);

  useEffect(() => {
    if (items.length && !highlighted) setHighlighted(items[0]);
  }, [items, highlighted]);

  const filtered = useMemo(() => {
    const status = STATUS_TABS[tab];
    if (status === 'all') return items;
    if (status === 'terminated') return items.filter((i) => i.status === 'lost' || i.status === 'cancelled');
    return items.filter((i) => i.status === status);
  }, [items, tab]);

  const stats = useMemo(() => ({
    active: items.filter((i) => i.status === 'active').length,
    highRisk: items.filter((i) => i.risk_level === 'high').length,
    dueSoon: items.filter((i) => {
      if (!i.edd_date) return false;
      const edd = new Date(i.edd_date);
      const diff = (edd.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff >= 0 && diff <= 30;
    }).length,
  }), [items]);

  const ga = highlighted ? estimateGA(highlighted.lmp_date) : null;

  const create = async () => {
    await apiClient.post('/staff/obgyn/pregnancies/', form);
    setOpen(false);
    load();
  };

  return (
    <Stack spacing={2.5}>
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff', boxShadow: '0 8px 32px rgba(156,39,176,0.25)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }} spacing={2}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{t('obgyn.workspaceTitle')}</Typography>
            <Typography sx={{ opacity: 0.92, mt: 0.5 }}>{branding.tagline_ar}</Typography>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip label={`${stats.active} ${t('obgyn.activePregnancies')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.highRisk} ${t('obgyn.highRiskCount')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
            <Chip label={`${stats.dueSoon} ${t('obgyn.dueSoonCount')}`} sx={{ bgcolor: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 }} />
          </Stack>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('obgyn.selectPatient')}</Typography>
              <Autocomplete
                options={patients}
                getOptionLabel={(p) => p.full_name}
                value={selectedPatient}
                onChange={(_, v) => { setSelectedPatient(v); if (v) setForm((f) => ({ ...f, patient: v.id })); }}
                renderInput={(p) => <TextField {...p} size="small" placeholder={t('obgyn.allPatients')} />}
              />
            </Paper>

            <PregnancyTimelineChart
              lmpDate={highlighted?.lmp_date}
              eddDate={highlighted?.edd_date}
              gestationalWeeks={ga?.weeks}
              gestationalDays={ga?.days}
              status={highlighted?.status}
              onWeekSelect={() => setOpen(true)}
            />

            <Paper sx={{ p: 2, borderRadius: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>{t('obgyn.quickActions')}</Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {[t('obgyn.quickFirstVisit'), t('obgyn.quickUltrasound'), t('obgyn.quickLab')].map((label) => (
                  <Chip key={label} label={label} clickable color="primary" variant="outlined" onClick={() => setOpen(true)} sx={{ fontWeight: 600 }} />
                ))}
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Paper sx={{ borderRadius: 3, overflow: 'hidden', minHeight: 480 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2, pt: 1.5 }}>
              <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable">
                <Tab label={t('obgyn.tabAll')} />
                <Tab label={t('obgyn.statusActive')} />
                <Tab label={t('obgyn.statusCompleted')} />
                <Tab label={t('obgyn.statusTerminated')} />
              </Tabs>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mb: 1 }}>
                {t('obgyn.newPregnancy')}
              </Button>
            </Stack>
            <Box sx={{ p: 2, maxHeight: 520, overflow: 'auto' }}>
              {filtered.length === 0 ? (
                <EmptyState message={t('obgyn.empty')} />
              ) : (
                <Stack spacing={1.5}>
                  {filtered.map((p) => {
                    const itemGa = estimateGA(p.lmp_date);
                    return (
                      <Card
                        key={p.id}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: highlighted?.id === p.id ? 'primary.main' : undefined,
                          '&:hover': { borderColor: 'primary.main', boxShadow: 1, cursor: 'pointer' },
                        }}
                        onClick={() => setHighlighted(p)}
                      >
                        <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography fontWeight={700}>{p.patient_name || t('obgyn.pregnancy')}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {t('obgyn.lmp')}: {fmtDate(p.lmp_date)} — {t('obgyn.edd')}: {fmtDate(p.edd_date)}
                                {itemGa ? ` — ${itemGa.weeks}${t('obgyn.weeksShort')}` : ''}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <StatusChip status={p.risk_level} namespace="obgyn.riskLevels" />
                              <Button size="small" component={RouterLink} to={`/dashboard/obgyn/${p.id}`} onClick={(e) => e.stopPropagation()}>
                                {t('obgyn.dashboard')}
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>{t('obgyn.newPregnancy')}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <TextField select label={t('patients.name')} value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} fullWidth>
                  {patients.map((p) => <MenuItem key={p.id} value={p.id}>{p.full_name}</MenuItem>)}
                </TextField>
                <TextField type="date" label={t('obgyn.lmp')} value={form.lmp_date} onChange={(e) => setForm({ ...form, lmp_date: e.target.value })} InputLabelProps={{ shrink: true }} fullWidth />
                <TextField label={t('obgyn.notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} fullWidth multiline rows={3} />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <PregnancyTimelineChart
                lmpDate={form.lmp_date || undefined}
                gestationalWeeks={form.lmp_date ? estimateGA(form.lmp_date)?.weeks : undefined}
                gestationalDays={form.lmp_date ? estimateGA(form.lmp_date)?.days : undefined}
                onWeekSelect={(week) => setForm((f) => ({ ...f, notes: `${t('obgyn.week')} ${week}` }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={create} disabled={!form.patient || !form.lmp_date}>{t('common.save')}</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
