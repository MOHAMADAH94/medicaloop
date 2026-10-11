import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import { saveTokens } from '@/shared/auth/tokens';
import WorkingHoursDisplay from '@/shared/components/WorkingHoursDisplay';
import { WorkingHour, isWorkingDay } from '@/shared/utils/workingHours';

interface Slot {
  start: string;
  end: string;
}

interface ClinicInfo {
  clinic: { name: string; slug: string };
  doctors: { full_name: string; specialty: string }[];
  working_hours: WorkingHour[];
}

type Step = 'date' | 'time' | 'auth' | 'confirm' | 'done';

const STAFF_TOKEN_KEY = 'staff_access_token';

export default function BookAppointmentPage() {
  const { clinicSlug } = useParams<{ clinicSlug: string }>();
  const { t } = useTranslation();
  const [step, setStep] = useState<Step>('date');
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const stepIndex = { date: 0, time: 1, auth: 1, confirm: 2, done: 2 }[step];
  const steps = [t('booking.selectDate'), t('booking.selectTime'), t('booking.confirm')];

  useEffect(() => {
    if (!clinicSlug) return;
    localStorage.setItem('last_clinic_slug', clinicSlug);

    // إذا كان الطبيب مسجّل دخول، احفظ توكنه مؤقتاً وامسحه ليتمكن المريض من الحجز
    const token = localStorage.getItem('access_token');
    if (token) {
      apiClient.get('/auth/me/').then((res) => {
        if (res.data.user_type === 'staff') {
          localStorage.setItem(STAFF_TOKEN_KEY, token);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }).catch(() => {});
    }

    apiClient.get(`/public/clinics/${clinicSlug}/`).then((res) => setClinicInfo(res.data));
    apiClient.get(`/public/clinics/${clinicSlug}/available-dates/`, { params: { days: 30 } })
      .then((res) => {
        setAvailableDates(res.data.dates || []);
        setWorkingDays(res.data.working_days || []);
      });
  }, [clinicSlug]);

  useEffect(() => {
    if (step !== 'time' || !date || !clinicSlug) return;
    setLoading(true);
    setError('');
    apiClient
      .get(`/public/clinics/${clinicSlug}/slots/`, { params: { date } })
      .then((res) => setSlots(res.data.slots || []))
      .catch(() => setError(t('booking.noSlots')))
      .finally(() => setLoading(false));
  }, [step, date, clinicSlug, t]);

  const savePatientTokens = (access: string, refresh: string) => {
    saveTokens(access, refresh);
  };

  const afterTimeSelected = () => {
    const loggedIn = !!localStorage.getItem('access_token');
    setStep(loggedIn ? 'confirm' : 'auth');
  };

  const handleAuth = async () => {
    setError('');
    try {
      if (authMode === 'login') {
        const { data } = await apiClient.post('/auth/login/', {
          username: authForm.username,
          password: authForm.password,
        });
        if (data.user?.user_type !== 'patient') {
          setError(t('booking.patientOnly'));
          return;
        }
        savePatientTokens(data.access, data.refresh);
      } else {
        const { data } = await apiClient.post('/auth/register/patient/', authForm);
        savePatientTokens(data.tokens.access, data.tokens.refresh);
      }
      setStep('confirm');
    } catch {
      setError(t('common.error'));
    }
  };

  const handleBook = async () => {
    if (!selectedSlot || !clinicSlug) return;
    setLoading(true);
    setError('');
    try {
      await apiClient.post(`/public/clinics/${clinicSlug}/appointments/`, {
        scheduled_start: selectedSlot.start,
      });
      setStep('done');
    } catch (err: unknown) {
      const resp = (err as { response?: { data?: { detail?: string }; status?: number } })?.response;
      if (resp?.status === 403) {
        setError(t('booking.patientOnly'));
      } else {
        setError(resp?.data?.detail || t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    setSelectedSlot(null);
    if (value && workingDays.length > 0 && !isWorkingDay(value, workingDays)) {
      setError(t('booking.notWorkingDay'));
    } else {
      setError('');
    }
  };

  const canProceedDate = date && (availableDates.length === 0 || availableDates.includes(date));

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{t('booking.title')}</Typography>

      {clinicInfo && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6">{clinicInfo.clinic.name}</Typography>
            {clinicInfo.doctors[0] && (
              <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap">
                <Chip label={clinicInfo.doctors[0].full_name} size="small" />
                <Chip label={clinicInfo.doctors[0].specialty} color="primary" size="small" variant="outlined" />
              </Stack>
            )}
            {clinicInfo.working_hours.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <WorkingHoursDisplay hours={clinicInfo.working_hours} title={t('public.workingHours')} />
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {step !== 'done' && (
        <Stepper activeStep={stepIndex} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {step === 'date' && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Alert severity="info">{t('booking.workingDaysHint')}</Alert>
              <TextField
                type="date"
                label={t('booking.date')}
                value={date}
                onChange={(e) => handleDateChange(e.target.value)}
                InputLabelProps={{ shrink: true }}
                inputProps={{ min: new Date().toISOString().slice(0, 10) }}
                fullWidth
              />
              {availableDates.length > 0 && (
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {availableDates.slice(0, 14).map((d) => (
                    <Chip
                      key={d}
                      label={new Date(d).toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })}
                      color={date === d ? 'primary' : 'default'}
                      onClick={() => handleDateChange(d)}
                      clickable
                    />
                  ))}
                </Stack>
              )}
              <Button variant="contained" disabled={!canProceedDate} onClick={() => setStep('time')}>
                {t('common.next')}
              </Button>
              <Button component={RouterLink} to={`/${clinicSlug}`}>{t('common.back')}</Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 'time' && (
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              {new Date(date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
            ) : slots.length === 0 ? (
              <Typography color="text.secondary">{t('booking.noSlots')}</Typography>
            ) : (
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                {slots.map((slot) => (
                  <Button
                    key={slot.start}
                    variant={selectedSlot?.start === slot.start ? 'contained' : 'outlined'}
                    onClick={() => setSelectedSlot(slot)}
                  >
                    {new Date(slot.start).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                  </Button>
                ))}
              </Stack>
            )}
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button onClick={() => setStep('date')}>{t('common.back')}</Button>
              <Button variant="contained" disabled={!selectedSlot} onClick={afterTimeSelected}>
                {t('common.next')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 'auth' && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('booking.loginRequired')}</Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              {selectedSlot && new Date(selectedSlot.start).toLocaleString('ar-SA')}
            </Alert>
            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
              <Button variant={authMode === 'login' ? 'contained' : 'outlined'} onClick={() => setAuthMode('login')}>
                {t('auth.login')}
              </Button>
              <Button variant={authMode === 'register' ? 'contained' : 'outlined'} onClick={() => setAuthMode('register')}>
                {t('auth.registerPatient')}
              </Button>
            </Stack>
            <Stack spacing={2}>
              {authMode === 'register' && (
                <>
                  <TextField label={t('auth.firstName')} value={authForm.first_name}
                    onChange={(e) => setAuthForm({ ...authForm, first_name: e.target.value })} fullWidth />
                  <TextField label={t('auth.lastName')} value={authForm.last_name}
                    onChange={(e) => setAuthForm({ ...authForm, last_name: e.target.value })} fullWidth />
                  <TextField label={t('patients.phone')} value={authForm.phone}
                    onChange={(e) => setAuthForm({ ...authForm, phone: e.target.value })} fullWidth />
                </>
              )}
              <TextField label={t('auth.username')} value={authForm.username}
                onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })} fullWidth required />
              <TextField label={t('auth.password')} type="password" value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} fullWidth />
              <Stack direction="row" spacing={2}>
                <Button onClick={() => setStep('time')}>{t('common.back')}</Button>
                <Button variant="contained" onClick={handleAuth}>{t('common.next')}</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 'confirm' && selectedSlot && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('booking.summary')}</Typography>
            <Typography>{clinicInfo?.clinic.name}</Typography>
            <Typography>{new Date(selectedSlot.start).toLocaleString('ar-SA')}</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button onClick={() => setStep(localStorage.getItem('access_token') ? 'time' : 'auth')}>
                {t('common.back')}
              </Button>
              <Button variant="contained" onClick={handleBook} disabled={loading}>
                {loading ? t('common.loading') : t('booking.confirmBooking')}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {step === 'done' && (
        <Card>
          <CardContent>
            <Alert severity="success" sx={{ mb: 2 }}>{t('booking.success')}</Alert>
            <Stack spacing={2}>
              <Button variant="contained" component={RouterLink} to="/portal">{t('booking.goPortal')}</Button>
              <Button component={RouterLink} to={`/${clinicSlug}`}>{t('booking.backToClinic')}</Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
