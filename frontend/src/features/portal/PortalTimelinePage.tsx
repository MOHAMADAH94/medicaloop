import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Chip, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import LoadingBox from '@/shared/components/LoadingBox';
import { fmtDateTime } from '@/shared/utils/format';

interface TimelineEvent {
  type: string;
  id: string;
  date: string;
  title: string;
  status?: string;
}

interface ClinicLink {
  clinic_id: string;
  clinic_name: string;
}

export default function PortalTimelinePage() {
  const { t } = useTranslation();
  const [clinicId, setClinicId] = useState('');
  const [clinics, setClinics] = useState<ClinicLink[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient.get('/patient/profile/').then((res) => {
      const links = res.data.clinic_links || [];
      setClinics(links);
      if (links[0]) setClinicId(links[0].clinic_id);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!clinicId) return;
    setLoading(true);
    apiClient.get('/patient/timeline/', { params: { clinic_id: clinicId } })
      .then((res) => setTimeline(res.data))
      .catch(() => setTimeline([]))
      .finally(() => setLoading(false));
  }, [clinicId]);

  return (
    <Stack spacing={2}>
      <PageHeader title={t('nav.timeline')} subtitle={t('portal.timelineHint')} />
      {clinics.length > 1 && (
        <TextField select label={t('portal.selectClinic')} value={clinicId}
          onChange={(e) => setClinicId(e.target.value)} fullWidth>
          {clinics.map((c) => <MenuItem key={c.clinic_id} value={c.clinic_id}>{c.clinic_name}</MenuItem>)}
        </TextField>
      )}
      {loading ? <LoadingBox /> : timeline.length === 0 ? (
        <Typography color="text.secondary">{t('patients.noTimeline')}</Typography>
      ) : timeline.map((event) => (
        <Box key={`${event.type}-${event.id}`} sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography fontWeight={600}>{event.title}</Typography>
            <Chip label={t(`timeline.${event.type}`, event.type)} size="small" />
          </Stack>
          <Typography variant="caption" color="text.secondary">{fmtDateTime(event.date)}</Typography>
        </Box>
      ))}
    </Stack>
  );
}
