import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import { apiClient } from '@/shared/api/client';
import WorkingHoursDisplay from '@/shared/components/WorkingHoursDisplay';
import { fmtMoney } from '@/shared/utils/format';
import { WorkingHour } from '@/shared/utils/workingHours';
import { resolveBranding, type SpecialtyBranding } from '@/theme';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface ClinicProfile {
  clinic: {
    name: string;
    slug: string;
    description: string;
    phone: string;
    address: string;
    city: string;
    specialty_code?: string;
    specialty_name?: string;
    branding?: SpecialtyBranding;
  };
  doctors: { id: string; full_name: string; specialty: string; bio: string }[];
  services: { id: string; name: string; price: string; duration_minutes?: number; description?: string }[];
  working_hours: WorkingHour[];
}

export default function PublicClinicPage() {
  const { clinicSlug } = useParams<{ clinicSlug: string }>();
  const { t } = useTranslation();
  const { setSpecialtyContext } = useSpecialtyTheme();
  const [data, setData] = useState<ClinicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!clinicSlug) return;
    apiClient.get(`/public/clinics/${clinicSlug}/`)
      .then((res) => {
        setData(res.data);
        const code = res.data.clinic?.specialty_code || 'general';
        setSpecialtyContext(code, res.data.clinic?.branding);
      })
      .catch(() => setError(t('common.error')))
      .finally(() => setLoading(false));
  }, [clinicSlug, t, setSpecialtyContext]);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  }
  if (error || !data) {
    return <Typography color="error">{error || t('common.error')}</Typography>;
  }

  const { clinic, doctors, services, working_hours } = data;
  const branding = resolveBranding(clinic.specialty_code, clinic.branding);

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          color: '#fff',
          background: branding.gradient,
          boxShadow: '0 16px 40px rgba(0,0,0,0.15)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
          <Avatar sx={{ width: 72, height: 72, bgcolor: 'rgba(255,255,255,0.2)' }}>
            <LocalHospitalIcon fontSize="large" />
          </Avatar>
          <Box flex={1}>
            <Typography variant="h3" fontWeight={800}>{clinic.name}</Typography>
            <Chip
              label={clinic.specialty_name || doctors[0]?.specialty || ''}
              sx={{ mt: 1, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff' }}
            />
            <Typography sx={{ mt: 1.5, maxWidth: 560, opacity: 0.95 }}>
              {clinic.description || branding.hero_ar}
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            component={RouterLink}
            to={`/${clinic.slug}/book`}
            sx={{ bgcolor: '#fff', color: branding.primary_dark, fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
          >
            {t('public.bookAppointment')}
          </Button>
        </Stack>
      </Box>

      {(clinic.address || clinic.city || clinic.phone) && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('public.about')}</Typography>
            {(clinic.address || clinic.city) && (
              <Typography>{[clinic.address, clinic.city].filter(Boolean).join('، ')}</Typography>
            )}
            {clinic.phone && <Typography>{clinic.phone}</Typography>}
          </CardContent>
        </Card>
      )}

      {doctors.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('public.doctors')}</Typography>
            <Stack spacing={2} divider={<Divider flexItem />}>
              {doctors.map((doc) => (
                <Box key={doc.id}>
                  <Typography variant="subtitle1" fontWeight={600}>{doc.full_name}</Typography>
                  <Typography color="primary" variant="body2">{doc.specialty}</Typography>
                  {doc.bio && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{doc.bio}</Typography>}
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent>
          <WorkingHoursDisplay hours={working_hours} title={t('public.workingHours')} />
        </CardContent>
      </Card>

      {services.length > 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('public.services')}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('public.servicesHint')}
            </Typography>
            <Grid container spacing={2}>
              {services.map((s) => (
                <Grid item xs={12} sm={6} md={4} key={s.id}>
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'background.default', height: '100%' }}>
                    <Typography fontWeight={700}>{s.name}</Typography>
                    {s.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{s.description}</Typography>
                    )}
                    <Stack direction="row" justifyContent="space-between" sx={{ mt: 1.5 }}>
                      <Typography color="primary" fontWeight={700}>{fmtMoney(s.price)}</Typography>
                      {s.duration_minutes && (
                        <Typography variant="caption" color="text.secondary">{s.duration_minutes} {t('public.minutes')}</Typography>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
