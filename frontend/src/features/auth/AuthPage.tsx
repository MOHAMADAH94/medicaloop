import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import { saveTokens } from '@/shared/auth/tokens';
import { usePermissions } from '@/shared/auth/PermissionsProvider';

export default function AuthPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reload: reloadPermissions } = usePermissions();
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    username: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  /** Tokens must land before permissions reload, otherwise the fetch runs unauthenticated. */
  const applySession = (tokens: { access: string; refresh: string }) => {
    saveTokens(tokens.access, tokens.refresh);
    reloadPermissions();
  };

  const handleLogin = async () => {
    setError('');
    try {
      const { data } = await apiClient.post('/auth/login/', {
        username: form.username,
        password: form.password,
      });
      applySession(data);
      const userType = data.user?.user_type;
      navigate(userType === 'patient' ? '/portal' : '/dashboard');
    } catch {
      setError(t('common.error'));
    }
  };

  const handleRegisterStaff = async () => {
    setError('');
    try {
      const { data } = await apiClient.post('/auth/register/staff/', {
        username: form.username,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email || undefined,
      });
      applySession(data.tokens);
      navigate('/onboarding');
    } catch {
      setError(t('common.error'));
    }
  };

  const handleRegisterPatient = async () => {
    setError('');
    try {
      const { data } = await apiClient.post('/auth/register/patient/', {
        username: form.username,
        password: form.password,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone,
        email: form.email || undefined,
      });
      applySession(data.tokens);
      navigate('/portal');
    } catch {
      setError(t('common.error'));
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Card sx={{ maxWidth: 440, width: '100%' }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>{t('auth.title')}</Typography>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
            <Tab label={t('auth.login')} />
            <Tab label={t('auth.registerStaff')} />
            <Tab label={t('auth.registerPatient')} />
          </Tabs>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <Stack spacing={2}>
            {tab > 0 && (
              <>
                <TextField label={t('auth.firstName')} value={form.first_name} onChange={handleChange('first_name')} fullWidth required />
                <TextField label={t('auth.lastName')} value={form.last_name} onChange={handleChange('last_name')} fullWidth required />
              </>
            )}
            <TextField
              label={t('auth.username')}
              value={form.username}
              onChange={handleChange('username')}
              fullWidth
              required
              helperText={tab > 0 ? t('auth.usernameHint') : undefined}
            />
            <TextField label={t('auth.password')} type="password" value={form.password} onChange={handleChange('password')} fullWidth required />
            {tab === 2 && (
              <>
                <TextField label={t('patients.phone')} value={form.phone} onChange={handleChange('phone')} fullWidth />
                <TextField label={t('auth.emailOptional')} type="email" value={form.email} onChange={handleChange('email')} fullWidth />
              </>
            )}
            {tab === 0 && (
              <Button variant="contained" onClick={handleLogin} fullWidth>{t('auth.login')}</Button>
            )}
            {tab === 1 && (
              <Button variant="contained" onClick={handleRegisterStaff} fullWidth>{t('auth.registerStaff')}</Button>
            )}
            {tab === 2 && (
              <Button variant="contained" onClick={handleRegisterPatient} fullWidth>{t('auth.registerPatient')}</Button>
            )}
            <Button component={RouterLink} to="/">{t('nav.home')}</Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
