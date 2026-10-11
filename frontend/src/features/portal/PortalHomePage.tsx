import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import {
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import MedicationIcon from '@mui/icons-material/Medication';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { apiClient } from '@/shared/api/client';
import { fmtDateTime } from '@/shared/utils/format';
import { unwrapList } from '@/shared/utils/api';

interface Appointment {
  id: string;
  scheduled_start: string;
  status: string;
}

export default function PortalHomePage() {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptionCount, setPrescriptionCount] = useState(0);
  const [followupCount, setFollowupCount] = useState(0);
  const [clinicSlug, setClinicSlug] = useState('');

  useEffect(() => {
    apiClient.get('/patient/appointments/').then((res) => {
      const list = unwrapList<Appointment>(res.data);
      setAppointments(list.filter((a) => new Date(a.scheduled_start) >= new Date()).slice(0, 3));
    });
    apiClient.get('/patient/prescriptions/').then((res) => setPrescriptionCount(unwrapList(res.data).length));
    apiClient.get('/patient/followups/').then((res) => setFollowupCount(unwrapList(res.data).length));
    apiClient.get('/patient/profile/').then(() => {
      setClinicSlug(localStorage.getItem('last_clinic_slug') || 'dr-sara');
    }).catch(() => setClinicSlug('dr-sara'));
  }, []);

  const stats = [
    { label: t('portal.upcomingAppointments'), value: appointments.length, icon: <EventIcon />, path: '/portal/appointments' },
    { label: t('nav.prescriptions'), value: prescriptionCount, icon: <MedicationIcon />, path: '/portal/prescriptions' },
    { label: t('nav.followups'), value: followupCount, icon: <AssignmentIcon />, path: '/portal/followups' },
  ];

  return (
    <Stack spacing={3}>
      <Typography variant="h5">{t('portal.welcome')}</Typography>
      <Button variant="contained" size="large" component={RouterLink} to={`/${clinicSlug}/book`}>
        {t('portal.bookNew')}
      </Button>

      <Grid container spacing={2}>
        {stats.map((s) => (
          <Grid item xs={4} key={s.path}>
            <Card component={RouterLink} to={s.path} sx={{ textDecoration: 'none', height: '100%' }}>
              <CardContent>
                {s.icon}
                <Typography variant="h4" sx={{ mt: 1 }}>{s.value}</Typography>
                <Typography variant="body2" color="text.secondary">{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Typography variant="h6">{t('portal.upcomingAppointments')}</Typography>
      {appointments.length === 0 ? (
        <Typography color="text.secondary">{t('portal.noAppointments')}</Typography>
      ) : appointments.map((a) => (
        <Card key={a.id}>
          <CardContent>
            <Typography>{fmtDateTime(a.scheduled_start)}</Typography>
            <Chip label={a.status} size="small" sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
