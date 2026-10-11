import { Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import { useClinicInfo } from '@/shared/hooks/useClinicSpecialty';
import { getSpecialtyConfig } from '@/shared/config/specialties';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';
import { useCallback, useEffect, useState } from 'react';

interface SpecialtyMetric {
  key: string;
  label_ar: string;
  value: number;
  color: string;
}

interface DashboardSummary {
  today_appointments: number;
  pending_bookings: number;
  overdue_followups: number;
  total_patients: number;
  specialty_code?: string;
  specialty_metrics?: SpecialtyMetric[];
  visit_templates?: string[];
  clinical_modules?: { key: string; label_ar: string; path: string }[];
}

interface Appointment {
  id: string;
  patient_name: string;
  scheduled_start: string;
  status: string;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { clinic, specialtyCode } = useClinicInfo();
  const { branding, setSpecialtyContext } = useSpecialtyTheme();
  const specialtyConfig = getSpecialtyConfig(specialtyCode);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pending, setPending] = useState<Appointment[]>([]);

  const load = useCallback(() => {
    apiClient.get('/staff/dashboard/').then((res) => {
      setSummary(res.data);
      if (res.data.specialty_branding) {
        setSpecialtyContext(res.data.specialty_code || specialtyCode, res.data.specialty_branding);
      }
    });
    apiClient.get('/staff/appointments/', { params: { status: 'pending' } }).then((res) => {
      setPending(res.data.results || res.data);
    });
  }, [setSpecialtyContext, specialtyCode]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (clinic?.branding) {
      setSpecialtyContext(clinic.specialty_code, clinic.branding);
    }
  }, [clinic, setSpecialtyContext]);

  const handleConfirm = async (id: string) => {
    await apiClient.post(`/staff/appointments/${id}/confirm/`);
    load();
  };

  const opsStats = [
    { label: t('dashboard.todayAppointments'), value: summary?.today_appointments ?? 0, color: branding.primary },
    { label: t('dashboard.pendingBookings'), value: summary?.pending_bookings ?? 0, color: '#ED6C02' },
    { label: t('dashboard.overdueFollowups'), value: summary?.overdue_followups ?? 0, color: '#D32F2F' },
    { label: t('dashboard.totalPatients'), value: summary?.total_patients ?? 0, color: '#2E7D32' },
  ];

  const specialtyMetrics = summary?.specialty_metrics || [];

  return (
    <Stack spacing={3}>
      <Box
        sx={{
          borderRadius: 3,
          p: { xs: 2.5, md: 3.5 },
          color: '#fff',
          background: branding.gradient,
          boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
        }}
      >
        <Typography variant="overline" sx={{ opacity: 0.9 }}>
          {clinic?.specialty_name || clinic?.specialty || specialtyCode}
        </Typography>
        <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
          {clinic?.name || t('dashboard.title')}
        </Typography>
        <Typography sx={{ mt: 1, maxWidth: 640, opacity: 0.95 }}>
          {branding.tagline_ar}
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ mt: 2.5 }} flexWrap="wrap" useFlexGap>
          {specialtyConfig && (
            <Button
              variant="contained"
              component={RouterLink}
              to={specialtyConfig.path}
              sx={{ bgcolor: 'rgba(255,255,255,0.95)', color: branding.primary_dark, '&:hover': { bgcolor: '#fff' } }}
            >
              {t(specialtyConfig.titleKey)}
            </Button>
          )}
          <Button variant="outlined" component={RouterLink} to="/dashboard/appointments" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.7)' }}>
            {t('appointments.new')}
          </Button>
          <Button variant="outlined" component={RouterLink} to="/dashboard/patients" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.7)' }}>
            {t('patients.add')}
          </Button>
        </Stack>
      </Box>

      {specialtyMetrics.length > 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>{t('dashboard.specialtyHub')}</Typography>
          <Grid container spacing={2}>
            {specialtyMetrics.map((m) => (
              <Grid item xs={12} sm={6} md={3} key={m.key}>
                <Card sx={{ borderTop: 4, borderColor: m.color, height: '100%' }}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">{m.label_ar}</Typography>
                    <Typography variant="h3" sx={{ mt: 1, color: m.color }}>{m.value}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Grid container spacing={2}>
        {opsStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ borderTop: 3, borderColor: stat.color }}>
              <CardContent>
                <Typography color="text.secondary" variant="body2">{stat.label}</Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {(summary?.visit_templates?.length || 0) > 0 && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>{t('dashboard.visitTemplates')}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {t('dashboard.visitTemplatesHint')}
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {summary!.visit_templates!.map((tpl) => (
              <Chip key={tpl} label={tpl} color="primary" variant="outlined" />
            ))}
          </Stack>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Typography variant="h6">{t('dashboard.pendingBookings')}</Typography>
          <Button component={RouterLink} to="/dashboard/appointments" size="small">{t('dashboard.viewAll')}</Button>
        </Stack>
        {pending.length === 0 ? (
          <Typography color="text.secondary">{t('appointments.empty')}</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t('patients.name')}</TableCell>
                <TableCell>{t('appointments.time')}</TableCell>
                <TableCell>{t('appointments.status')}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {pending.slice(0, 5).map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.patient_name}</TableCell>
                  <TableCell>{new Date(a.scheduled_start).toLocaleString('ar-SA')}</TableCell>
                  <TableCell>{a.status}</TableCell>
                  <TableCell>
                    <Button size="small" variant="contained" onClick={() => handleConfirm(a.id)}>
                      {t('appointments.confirm')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Stack>
  );
}
