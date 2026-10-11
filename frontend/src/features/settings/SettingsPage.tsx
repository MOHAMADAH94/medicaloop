import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import WorkingHoursDisplay from '@/shared/components/WorkingHoursDisplay';
import { useToast } from '@/shared/feedback/ToastProvider';
import { fmtMoney } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';
import { extractApiError } from '@/shared/utils/errors';
import { WEEKDAYS } from '@/shared/utils/workingHours';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';
import { applyClinicThemeColor, resolveBranding, THEME_COLOR_PRESETS, type SpecialtyBranding } from '@/theme';

interface ClinicSettings {
  appointment_duration_minutes: number;
  max_daily_appointments: number;
  auto_confirm_appointments: boolean;
  cancellation_hours_before: number;
  allow_patient_reschedule: boolean;
  theme_color?: string;
}

interface WorkingHour {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

interface Holiday { id: string; date: string; reason: string }

interface Service {
  id: string;
  name: string;
  price: string;
  duration_minutes: number;
  is_public: boolean;
  is_active: boolean;
}

interface SpecialtyModule {
  code: string;
  name: string;
  name_ar: string;
  enabled: boolean;
  active: boolean;
}

interface ClinicInfo {
  name: string;
  specialty: string;
  specialty_modules: SpecialtyModule[];
}

type PendingDelete = { endpoint: string; id: string; label: string } | null;

export default function SettingsPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const { branding, specialtyCode, setSpecialtyContext } = useSpecialtyTheme();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [hours, setHours] = useState<WorkingHour[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [hourForm, setHourForm] = useState({ day_of_week: 0, start_time: '09:00', end_time: '17:00' });
  const [holidayForm, setHolidayForm] = useState({ date: '', reason: '' });
  const [serviceForm, setServiceForm] = useState({ name: '', price: '0', duration_minutes: 30, is_public: true });
  const [pendingDelete, setPendingDelete] = useState<PendingDelete>(null);
  const [busy, setBusy] = useState(false);

  const applyBranding = useCallback((code: string | undefined, next?: Partial<SpecialtyBranding> | null) => {
    setSpecialtyContext(code || 'general', next);
  }, [setSpecialtyContext]);

  const load = useCallback(() => {
    setLoading(true);
    setLoadError('');
    Promise.all([
      apiClient.get('/staff/settings/current/'),
      apiClient.get('/staff/clinic/'),
      apiClient.get('/staff/working-hours/'),
      apiClient.get('/staff/holidays/'),
      apiClient.get('/staff/services/'),
    ]).then(([settingsRes, clinicRes, hoursRes, holidaysRes, servicesRes]) => {
      setSettings(settingsRes.data);
      setClinicInfo(clinicRes.data);
      setHours(unwrapList(hoursRes.data));
      setHolidays(unwrapList(holidaysRes.data));
      setServices(unwrapList(servicesRes.data));
      applyBranding(clinicRes.data.specialty_code, clinicRes.data.branding);
    }).catch((err) => setLoadError(extractApiError(err, t('common.error'))))
      .finally(() => setLoading(false));
  }, [t, applyBranding]);

  useEffect(() => { load(); }, [load]);

  const run = async (fn: () => Promise<unknown>, successKey = 'common.saved') => {
    try {
      await fn();
      toast.success(t(successKey));
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('common.error')));
    }
  };

  const saveSettings = () => run(async () => {
    const res = await apiClient.patch('/staff/settings/current/', settings);
    if (res.data.branding) {
      applyBranding(specialtyCode, res.data.branding);
    }
  });

  const previewColor = (hex: string) => {
    if (!settings) return;
    setSettings({ ...settings, theme_color: hex });
    const base = resolveBranding(specialtyCode);
    applyBranding(specialtyCode, hex ? applyClinicThemeColor(base, hex) : base);
  };

  const addHour = () => run(async () => {
    await apiClient.post('/staff/working-hours/', hourForm);
  });

  const toggleHour = (hour: WorkingHour) => run(() =>
    apiClient.patch(`/staff/working-hours/${hour.id}/`, { is_active: !hour.is_active }));

  const addHoliday = () => run(async () => {
    await apiClient.post('/staff/holidays/', holidayForm);
    setHolidayForm({ date: '', reason: '' });
  });

  const addService = () => run(async () => {
    await apiClient.post('/staff/services/', { ...serviceForm, is_active: true });
    setServiceForm({ name: '', price: '0', duration_minutes: 30, is_public: true });
  });

  const updateService = (service: Service, patch: Partial<Service>) => run(() =>
    apiClient.patch(`/staff/services/${service.id}/`, patch));

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await apiClient.delete(`${pendingDelete.endpoint}${pendingDelete.id}/`);
      toast.success(t('common.deleted'));
      setPendingDelete(null);
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('common.error')));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  }

  if (loadError) {
    return <Alert severity="error">{loadError}</Alert>;
  }

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.settings')} subtitle={clinicInfo?.name} />

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" scrollButtons="auto">
        <Tab label={t('settings.general')} />
        <Tab label={t('settings.appearance')} />
        <Tab label={t('settings.workingHours')} />
        <Tab label={t('settings.holidays')} />
        <Tab label={t('settings.services')} />
        <Tab label={t('settings.specialty')} />
      </Tabs>

      {tab === 0 && settings && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField type="number" label={t('settings.appointmentDuration')} value={settings.appointment_duration_minutes}
                onChange={(e) => setSettings({ ...settings, appointment_duration_minutes: Number(e.target.value) })} />
              <TextField type="number" label={t('settings.maxDaily')} value={settings.max_daily_appointments}
                onChange={(e) => setSettings({ ...settings, max_daily_appointments: Number(e.target.value) })} />
              <TextField type="number" label={t('settings.cancellationHours')} value={settings.cancellation_hours_before}
                onChange={(e) => setSettings({ ...settings, cancellation_hours_before: Number(e.target.value) })} />
              <FormControlLabel control={<Switch checked={settings.auto_confirm_appointments}
                onChange={(e) => setSettings({ ...settings, auto_confirm_appointments: e.target.checked })} />}
                label={t('settings.autoConfirm')} />
              <FormControlLabel control={<Switch checked={settings.allow_patient_reschedule}
                onChange={(e) => setSettings({ ...settings, allow_patient_reschedule: e.target.checked })} />}
                label={t('settings.allowReschedule')} />
              <Button variant="contained" onClick={saveSettings}>{t('common.save')}</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 1 && settings && (
        <Card>
          <CardContent>
            <Stack spacing={2.5}>
              <Typography variant="h6">{t('settings.themeColor')}</Typography>
              <Typography variant="body2" color="text.secondary">{t('settings.themeColorHint')}</Typography>
              <Box
                sx={{
                  height: 64,
                  borderRadius: 2,
                  background: branding.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  px: 2.5,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                }}
              >
                <Typography color="#fff" fontWeight={700}>{t('settings.themePreview')}</Typography>
              </Box>
              <Stack direction="row" spacing={1.25} flexWrap="wrap" useFlexGap>
                <Box
                  component="button"
                  type="button"
                  aria-label={t('settings.themeDefault')}
                  onClick={() => previewColor('')}
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    bgcolor: resolveBranding(specialtyCode).primary,
                    border: '2px dashed rgba(255,255,255,0.85)',
                    outline: !(settings.theme_color)
                      ? `3px solid ${resolveBranding(specialtyCode).primary}`
                      : '1px solid rgba(0,0,0,0.12)',
                    cursor: 'pointer',
                    p: 0,
                  }}
                />
                {THEME_COLOR_PRESETS.map((color) => {
                  const selected = (settings.theme_color || '').toUpperCase() === color;
                  return (
                    <Box
                      key={color}
                      component="button"
                      type="button"
                      aria-label={color}
                      onClick={() => previewColor(color)}
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: '50%',
                        bgcolor: color,
                        border: selected ? '3px solid #fff' : '2px solid #fff',
                        outline: selected ? `3px solid ${color}` : '1px solid rgba(0,0,0,0.12)',
                        cursor: 'pointer',
                        p: 0,
                        boxShadow: selected ? 2 : 0,
                      }}
                    />
                  );
                })}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                <Typography variant="body2" color="text.secondary">{t('settings.themeCustom')}</Typography>
                <Box
                  component="input"
                  type="color"
                  value={settings.theme_color || branding.primary}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => previewColor(e.target.value.toUpperCase())}
                  sx={{ width: 56, height: 40, border: 'none', background: 'transparent', cursor: 'pointer', p: 0 }}
                />
                <Button variant="outlined" onClick={() => previewColor('')}>{t('settings.themeReset')}</Button>
              </Stack>
              <Button variant="contained" onClick={saveSettings}>{t('common.save')}</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Stack spacing={2}>
          <Card>
            <CardContent>
              <WorkingHoursDisplay hours={hours.filter((h) => h.is_active)} title={t('settings.currentHours')} />
            </CardContent>
          </Card>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>{t('settings.addWorkingHours')}</Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField select label={t('settings.day')} value={hourForm.day_of_week}
                onChange={(e) => setHourForm({ ...hourForm, day_of_week: Number(e.target.value) })} sx={{ minWidth: 160 }}>
                {WEEKDAYS.map((d, i) => <MenuItem key={d} value={i}>{t(`settings.days.${d}`)}</MenuItem>)}
              </TextField>
              <TextField type="time" label={t('settings.from')} value={hourForm.start_time}
                onChange={(e) => setHourForm({ ...hourForm, start_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField type="time" label={t('settings.to')} value={hourForm.end_time}
                onChange={(e) => setHourForm({ ...hourForm, end_time: e.target.value })} InputLabelProps={{ shrink: true }} />
              <Button variant="contained" onClick={addHour}>{t('common.add')}</Button>
            </Stack>
          </Paper>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('settings.day')}</TableCell>
                  <TableCell>{t('settings.from')}</TableCell>
                  <TableCell>{t('settings.to')}</TableCell>
                  <TableCell align="center">{t('settings.active')}</TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hours.length === 0 ? (
                  <TableRow><TableCell colSpan={5}><EmptyState message={t('settings.noWorkingHours')} /></TableCell></TableRow>
                ) : hours.map((h) => (
                  <TableRow key={h.id} hover>
                    <TableCell>{t(`settings.days.${WEEKDAYS[h.day_of_week]}`)}</TableCell>
                    <TableCell>{h.start_time.slice(0, 5)}</TableCell>
                    <TableCell>{h.end_time.slice(0, 5)}</TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={h.is_active} onChange={() => toggleHour(h)} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => setPendingDelete({
                          endpoint: '/staff/working-hours/',
                          id: h.id,
                          label: t(`settings.days.${WEEKDAYS[h.day_of_week]}`),
                        })}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {tab === 3 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField type="date" label={t('booking.date')} value={holidayForm.date}
                onChange={(e) => setHolidayForm({ ...holidayForm, date: e.target.value })} InputLabelProps={{ shrink: true }} />
              <TextField label={t('settings.reason')} value={holidayForm.reason}
                onChange={(e) => setHolidayForm({ ...holidayForm, reason: e.target.value })} sx={{ flex: 1 }} />
              <Button variant="contained" onClick={addHoliday} disabled={!holidayForm.date}>{t('common.add')}</Button>
            </Stack>
          </Paper>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('booking.date')}</TableCell>
                  <TableCell>{t('settings.reason')}</TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {holidays.length === 0 ? (
                  <TableRow><TableCell colSpan={3}><EmptyState message={t('settings.noHolidays')} /></TableCell></TableRow>
                ) : holidays.map((h) => (
                  <TableRow key={h.id} hover>
                    <TableCell>{h.date}</TableCell>
                    <TableCell>{h.reason}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => setPendingDelete({ endpoint: '/staff/holidays/', id: h.id, label: h.date })}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {tab === 4 && (
        <Stack spacing={2}>
          <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField label={t('settings.serviceName')} value={serviceForm.name}
                onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })} sx={{ flex: 1 }} />
              <TextField type="number" label={t('settings.price')} value={serviceForm.price}
                onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })} />
              <TextField type="number" label={t('settings.duration')} value={serviceForm.duration_minutes}
                onChange={(e) => setServiceForm({ ...serviceForm, duration_minutes: Number(e.target.value) })} />
              <Button variant="contained" onClick={addService} disabled={!serviceForm.name}>{t('common.add')}</Button>
            </Stack>
          </Paper>
          <Paper>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t('settings.serviceName')}</TableCell>
                  <TableCell>{t('settings.price')}</TableCell>
                  <TableCell>{t('settings.duration')}</TableCell>
                  <TableCell align="center">{t('settings.public')}</TableCell>
                  <TableCell align="center">{t('settings.active')}</TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {services.length === 0 ? (
                  <TableRow><TableCell colSpan={6}><EmptyState message={t('settings.noServices')} /></TableCell></TableRow>
                ) : services.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.name}</TableCell>
                    <TableCell>{fmtMoney(s.price)}</TableCell>
                    <TableCell>{s.duration_minutes} {t('settings.minutes')}</TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={s.is_public}
                        onChange={() => updateService(s, { is_public: !s.is_public })} />
                    </TableCell>
                    <TableCell align="center">
                      <Switch size="small" checked={s.is_active}
                        onChange={() => updateService(s, { is_active: !s.is_active })} />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => setPendingDelete({ endpoint: '/staff/services/', id: s.id, label: s.name })}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {tab === 5 && clinicInfo && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">{t('settings.currentSpecialty')}</Typography>
              <Chip label={clinicInfo.specialty || t('settings.noSpecialty')} color="primary" />
              <Typography variant="body2" color="text.secondary">{t('settings.specialtyHint')}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>{t('settings.availableModules')}</Typography>
              <Stack spacing={1}>
                {clinicInfo.specialty_modules?.map((mod) => (
                  <Stack key={mod.code} direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ flex: 1 }}>{mod.name_ar || mod.name}</Typography>
                    {mod.active && <Chip label={t('settings.active')} color="success" size="small" />}
                    {!mod.enabled && <Chip label={t('settings.comingSoon')} size="small" variant="outlined" />}
                    {mod.enabled && !mod.active && <Chip label={t('settings.available')} size="small" variant="outlined" />}
                  </Stack>
                ))}
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        message={t('settings.deleteConfirm', { name: pendingDelete?.label })}
        busy={busy}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  );
}
