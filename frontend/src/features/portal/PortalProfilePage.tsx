import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Button, Card, CardContent, Stack, TextField } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';

interface Profile {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  date_of_birth: string;
  allergies: string;
  chronic_conditions: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
}

export default function PortalProfilePage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<Profile | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiClient.get('/patient/profile/').then((res) => setForm(res.data));
  }, []);

  const save = async () => {
    if (!form) return;
    await apiClient.patch('/patient/profile/', form);
    setSaved(true);
  };

  if (!form) return null;

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.profile')} action={<Button variant="contained" onClick={save}>{t('common.save')}</Button>} />
      {saved && <Alert severity="success" onClose={() => setSaved(false)}>{t('common.saved')}</Alert>}
      <Card>
        <CardContent>
          <Stack spacing={2}>
            <TextField label={t('auth.firstName')} value={form.first_name}
              onChange={(e) => setForm({ ...form, first_name: e.target.value })} fullWidth />
            <TextField label={t('auth.lastName')} value={form.last_name}
              onChange={(e) => setForm({ ...form, last_name: e.target.value })} fullWidth />
            <TextField label={t('auth.emailOptional')} value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} fullWidth />
            <TextField label={t('patients.phone')} value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })} fullWidth />
            <TextField type="date" label={t('patients.dob')} value={form.date_of_birth || ''}
              onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
              InputLabelProps={{ shrink: true }} fullWidth />
            <TextField label={t('patients.allergies')} value={form.allergies || ''}
              onChange={(e) => setForm({ ...form, allergies: e.target.value })} fullWidth multiline />
            <TextField label={t('patients.conditions')} value={form.chronic_conditions || ''}
              onChange={(e) => setForm({ ...form, chronic_conditions: e.target.value })} fullWidth multiline />
            <TextField label={t('portal.emergencyName')} value={form.emergency_contact_name || ''}
              onChange={(e) => setForm({ ...form, emergency_contact_name: e.target.value })} fullWidth />
            <TextField label={t('portal.emergencyPhone')} value={form.emergency_contact_phone || ''}
              onChange={(e) => setForm({ ...form, emergency_contact_phone: e.target.value })} fullWidth />
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
