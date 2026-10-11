import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  CircularProgress,
  Grid,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { apiClient } from '@/shared/api/client';
import { useSpecialtyCatalog, SpecialtyModule } from '@/shared/hooks/useClinicSpecialty';
import { getCatalogEntry } from '@/shared/config/specialtyCatalog';
import { saveTokens } from '@/shared/auth/tokens';
import { usePermissions } from '@/shared/auth/PermissionsProvider';

const steps = ['clinic', 'specialty', 'details'];

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reload: reloadPermissions } = usePermissions();
  const { specialties, loading: catalogLoading } = useSpecialtyCatalog();
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: '',
    specialty_code: 'obgyn',
    slug: '',
    description: '',
    phone: '',
    address: '',
    city: '',
  });

  useEffect(() => {
    if (specialties.length && !specialties.find((s) => s.code === form.specialty_code)) {
      setForm((f) => ({ ...f, specialty_code: specialties[0].code }));
    }
  }, [specialties, form.specialty_code]);

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);
    try {
      const { data } = await apiClient.post('/auth/clinic/create/', form);
      // The new token carries the clinic claim, so permissions must be refetched with it.
      saveTokens(data.tokens.access, data.tokens.refresh);
      reloadPermissions();
      navigate('/dashboard');
    } catch {
      setError(t('common.error'));
    } finally {
      setSubmitting(false);
    }
  };

  const canNext = activeStep === 0 ? !!form.name.trim() : activeStep === 1 ? !!form.specialty_code : true;

  const renderSpecialtyCard = (spec: SpecialtyModule) => {
    const selected = form.specialty_code === spec.code;
    const catalog = getCatalogEntry(spec.code);
    return (
      <Grid item xs={12} sm={6} md={4} key={spec.code}>
        <Card
          variant={selected ? 'elevation' : 'outlined'}
          sx={{
            height: '100%',
            borderColor: selected ? 'primary.main' : 'divider',
            borderWidth: selected ? 2 : 1,
            transition: 'transform 0.15s',
            '&:hover': { transform: 'translateY(-2px)', boxShadow: 2 },
          }}
        >
          <CardActionArea onClick={() => setForm((f) => ({ ...f, specialty_code: spec.code }))} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Box sx={{ color: selected ? 'primary.main' : 'text.secondary', mt: 0.5, display: 'flex' }}>
                  {catalog?.icon}
                </Box>
                <Box flex={1}>
                  <Typography fontWeight={700} variant="body1">{spec.name_ar || spec.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{spec.name}</Typography>
                </Box>
                {selected && <CheckCircleIcon color="primary" fontSize="small" />}
              </Stack>
            </CardContent>
          </CardActionArea>
        </Card>
      </Grid>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: activeStep === 1 ? 900 : 600, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>{t('onboarding.title')}</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>{t('onboarding.subtitle')}</Typography>
          <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
            {steps.map((s) => (
              <Step key={s}><StepLabel>{t(`onboarding.${s}`)}</StepLabel></Step>
            ))}
          </Stepper>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            {activeStep === 0 && (
              <TextField label={t('onboarding.clinicName')} value={form.name} onChange={handleChange('name')} fullWidth required />
            )}
            {activeStep === 1 && (
              catalogLoading ? (
                <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
              ) : (
                <Grid container spacing={1.5}>
                  {specialties.map(renderSpecialtyCard)}
                </Grid>
              )
            )}
            {activeStep === 2 && (
              <>
                <TextField label={t('onboarding.slug')} value={form.slug} onChange={handleChange('slug')} fullWidth helperText={t('onboarding.slugHint')} />
                <TextField label={t('onboarding.phone')} value={form.phone} onChange={handleChange('phone')} fullWidth />
                <TextField label={t('onboarding.address')} value={form.address} onChange={handleChange('address')} fullWidth />
                <TextField label={t('onboarding.city')} value={form.city} onChange={handleChange('city')} fullWidth />
                <TextField label={t('onboarding.description')} multiline rows={3} value={form.description} onChange={handleChange('description')} fullWidth />
              </>
            )}
            <Stack direction="row" spacing={2}>
              {activeStep > 0 && (
                <Button onClick={() => setActiveStep((s) => s - 1)}>{t('common.back')}</Button>
              )}
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" disabled={!canNext} onClick={() => setActiveStep((s) => s + 1)}>
                  {t('common.next')}
                </Button>
              ) : (
                <Button variant="contained" disabled={submitting} onClick={handleSubmit}>
                  {submitting ? t('common.loading') : t('onboarding.finish')}
                </Button>
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
