import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, CardContent, Container, Grid, Stack, Typography } from '@mui/material';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { checkHealth } from '@/shared/api/client';

export default function HomePage() {
  const { t } = useTranslation();
  const [apiStatus, setApiStatus] = useState('...');

  useEffect(() => {
    checkHealth().then((d) => setApiStatus(d.status)).catch(() => setApiStatus('offline'));
  }, []);

  const features = [
    { icon: <EventAvailableIcon fontSize="large" color="primary" />, title: t('nav.appointments') },
    { icon: <LocalHospitalIcon fontSize="large" color="primary" />, title: t('nav.visits') },
    { icon: <HealthAndSafetyIcon fontSize="large" color="primary" />, title: t('nav.obgyn') },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Stack spacing={4} alignItems="center">
          <Typography variant="h3" fontWeight={700} align="center">{t('home.title')}</Typography>
          <Typography variant="h6" color="text.secondary" align="center">{t('home.subtitle')}</Typography>
          <Typography variant="body2" color="text.secondary">{t('home.features')}</Typography>

          <Grid container spacing={2} sx={{ width: '100%' }}>
            {features.map((f) => (
              <Grid item xs={12} sm={4} key={f.title}>
                <Card sx={{ textAlign: 'center', height: '100%' }}>
                  <CardContent>
                    {f.icon}
                    <Typography sx={{ mt: 1 }}>{f.title}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', maxWidth: 480 }}>
            <Button variant="contained" size="large" component={RouterLink} to="/auth" fullWidth>
              {t('home.staffEntry')}
            </Button>
            <Button variant="outlined" size="large" component={RouterLink} to="/auth" fullWidth>
              {t('home.patientEntry')}
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">API: {apiStatus}</Typography>
        </Stack>
      </Container>
    </Box>
  );
}
