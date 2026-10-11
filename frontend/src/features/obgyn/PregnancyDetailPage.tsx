import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Button,
  Box,
  Card,
  CardContent,
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
import LoadingBox from '@/shared/components/LoadingBox';
import StatusChip from '@/shared/components/StatusChip';
import PregnancyTimelineChart from '@/features/obgyn/PregnancyTimelineChart';
import { fmtDate } from '@/shared/utils/format';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';

interface DashboardData {
  pregnancy: { id: string; lmp_date: string; edd_date: string; status: string; risk_level: string; notes: string };
  gestational_age: { weeks: number; days: number } | null;
  visits: { id: string; visit_date: string; gestational_age_weeks: number; weight: string; blood_pressure: string }[];
  ultrasounds: { id: string; date: string; findings: string }[];
  risk_factors: { id: string; name: string; severity: string }[];
}

export default function PregnancyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const { branding } = useSpecialtyTheme();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    apiClient.get(`/staff/obgyn/pregnancies/${id}/dashboard/`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingBox />;
  if (!data) return <Typography color="error">{t('common.error')}</Typography>;

  const { pregnancy, gestational_age, visits, ultrasounds, risk_factors } = data;

  return (
    <Stack spacing={2.5}>
      <Box sx={{ p: 2.5, borderRadius: 3, background: branding.gradient, color: '#fff' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>{t('obgyn.dashboard')}</Typography>
            {gestational_age && (
              <Typography sx={{ opacity: 0.92, mt: 0.5 }}>
                {t('obgyn.gestationalAge', { weeks: gestational_age.weeks, days: gestational_age.days })}
              </Typography>
            )}
          </Box>
          <Button component={RouterLink} to="/dashboard/obgyn" variant="outlined" sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.6)' }}>
            {t('common.back')}
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={5}>
          <PregnancyTimelineChart
            lmpDate={pregnancy.lmp_date}
            eddDate={pregnancy.edd_date}
            gestationalWeeks={gestational_age?.weeks}
            gestationalDays={gestational_age?.days}
            status={pregnancy.status}
          />
        </Grid>
        <Grid item xs={12} lg={7}>
          <Stack spacing={2}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>{t('obgyn.summary')}</Typography>
                <Typography>{t('obgyn.lmp')}: {fmtDate(pregnancy.lmp_date)}</Typography>
                <Typography>{t('obgyn.edd')}: {fmtDate(pregnancy.edd_date)}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <StatusChip status={pregnancy.status} namespace="obgyn.statuses" />
                  <StatusChip status={pregnancy.risk_level} namespace="obgyn.riskLevels" />
                </Stack>
                {pregnancy.notes && <Typography sx={{ mt: 2 }} color="text.secondary">{pregnancy.notes}</Typography>}
              </CardContent>
            </Card>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom fontWeight={700}>{t('obgyn.riskFactors')}</Typography>
                {risk_factors.length === 0 ? (
                  <Typography color="text.secondary">{t('obgyn.noRiskFactors')}</Typography>
                ) : risk_factors.map((r) => (
                  <Stack key={r.id} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Typography>{r.name}</Typography>
                    <StatusChip status={r.severity} namespace="obgyn.riskLevels" />
                  </Stack>
                ))}
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={700}>{t('obgyn.prenatalVisits')}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('visits.date')}</TableCell>
              <TableCell>{t('obgyn.ga')}</TableCell>
              <TableCell>{t('obgyn.weight')}</TableCell>
              <TableCell>{t('obgyn.bp')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visits.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{fmtDate(v.visit_date)}</TableCell>
                <TableCell>{v.gestational_age_weeks} {t('obgyn.weeks')}</TableCell>
                <TableCell>{v.weight || '—'}</TableCell>
                <TableCell>{v.blood_pressure || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={700}>{t('obgyn.ultrasounds')}</Typography>
        {ultrasounds.length === 0 ? (
          <Typography color="text.secondary">{t('obgyn.noUltrasounds')}</Typography>
        ) : ultrasounds.map((u) => (
          <Typography key={u.id} sx={{ mb: 1 }}>{fmtDate(u.date)} — {u.findings}</Typography>
        ))}
      </Paper>
    </Stack>
  );
}
