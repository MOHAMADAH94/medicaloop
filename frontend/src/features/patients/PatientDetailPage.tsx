import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useClinicInfo } from '@/shared/hooks/useClinicSpecialty';
import { getSpecialtyConfig } from '@/shared/config/specialties';
import TimelineIcon from '@mui/icons-material/Timeline';
import { apiClient } from '@/shared/api/client';

interface TimelineEvent {
  type: string;
  id: string;
  date: string;
  title: string;
  status?: string;
}

interface Patient {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  date_of_birth: string | null;
  allergies: string;
  chronic_conditions: string;
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { specialtyCode } = useClinicInfo();
  const specialtyConfig = getSpecialtyConfig(specialtyCode);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      apiClient.get(`/staff/patients/${id}/`),
      apiClient.get(`/staff/patients/${id}/timeline/`),
    ]).then(([pRes, tRes]) => {
      setPatient(pRes.data);
      setTimeline(tRes.data);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>;
  }

  if (!patient) return <Typography color="error">{t('common.error')}</Typography>;

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">{patient.full_name}</Typography>
        <Stack direction="row" spacing={1}>
          {specialtyConfig && (
            <Button
              variant="outlined"
              startIcon={specialtyConfig.icon}
              component={RouterLink}
              to={`${specialtyConfig.path}?patient=${id}`}
            >
              {t(specialtyConfig.titleKey)}
            </Button>
          )}
          <Button component={RouterLink} to="/dashboard/patients">{t('common.back')}</Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>{t('patients.profile')}</Typography>
            <Typography>{t('patients.phone')}: {patient.phone || '—'}</Typography>
            <Typography>{t('auth.email')}: {patient.email || '—'}</Typography>
            {patient.date_of_birth && (
              <Typography>{t('patients.dob')}: {new Date(patient.date_of_birth).toLocaleDateString('ar-SA')}</Typography>
            )}
            {patient.allergies && (
              <Typography color="error" sx={{ mt: 1 }}>{t('patients.allergies')}: {patient.allergies}</Typography>
            )}
            {patient.chronic_conditions && (
              <Typography sx={{ mt: 1 }}>{t('patients.conditions')}: {patient.chronic_conditions}</Typography>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TimelineIcon color="primary" />
              <Typography variant="h6">{t('patients.timeline')}</Typography>
            </Stack>
            {timeline.length === 0 ? (
              <Typography color="text.secondary">{t('patients.noTimeline')}</Typography>
            ) : (
              <Stack spacing={1}>
                {timeline.map((event) => (
                  <Box key={`${event.type}-${event.id}`} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography fontWeight={500}>{event.title}</Typography>
                      <Chip label={t(`timeline.${event.type}`, event.type)} size="small" />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(event.date).toLocaleString('ar-SA')}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>
    </Stack>
  );
}
