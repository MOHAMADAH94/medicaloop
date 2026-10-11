import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import LoadingBox from '@/shared/components/LoadingBox';
import StatusChip from '@/shared/components/StatusChip';
import { fmtDateTime } from '@/shared/utils/format';

interface Visit {
  id: string;
  patient: string;
  visit_date: string;
  status: string;
  chief_complaint: string;
  symptoms: string;
  treatment: string;
  patient_instructions: string;
  patient_instructions_visible: boolean;
}

interface PrescriptionItem {
  medication_name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ chief_complaint: '', symptoms: '', treatment: '', patient_instructions: '', patient_instructions_visible: true });
  const [rxItems, setRxItems] = useState<PrescriptionItem[]>([{ medication_name: '', dosage: '', frequency: '', duration: '' }]);
  const [fileForm, setFileForm] = useState({ category: 'report', description: '', visibility: 'patient_visible' });
  const [followup, setFollowup] = useState({ title: '', due_date: '', patient_instructions: '', patient_visible: true });

  const load = () => {
    if (!id) return;
    apiClient.get(`/staff/visits/${id}/`).then((res) => {
      setVisit(res.data);
      setForm({
        chief_complaint: res.data.chief_complaint || '',
        symptoms: res.data.symptoms || '',
        treatment: res.data.treatment || '',
        patient_instructions: res.data.patient_instructions || '',
        patient_instructions_visible: res.data.patient_instructions_visible ?? true,
      });
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const saveVisit = async () => {
    await apiClient.patch(`/staff/visits/${id}/`, form);
    setSaved(true);
    load();
  };

  const completeVisit = async () => {
    await apiClient.post(`/staff/visits/${id}/complete/`);
    load();
  };

  const createPrescription = async () => {
    if (!visit) return;
    await apiClient.post('/staff/prescriptions/', {
      visit: visit.id,
      patient: visit.patient,
      visibility: 'patient_visible',
      items: rxItems.filter((i) => i.medication_name),
    });
    setRxItems([{ medication_name: '', dosage: '', frequency: '', duration: '' }]);
    setSaved(true);
  };

  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!visit || !e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    fd.append('patient', visit.patient);
    fd.append('visit', visit.id);
    fd.append('category', fileForm.category);
    fd.append('description', fileForm.description);
    fd.append('visibility', fileForm.visibility);
    await apiClient.post('/staff/files/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setSaved(true);
  };

  const createFollowup = async () => {
    if (!visit) return;
    const planRes = await apiClient.post('/staff/followup-plans/', {
      patient: visit.patient,
      visit: visit.id,
      title: followup.title,
      description: followup.patient_instructions,
    });
    await apiClient.post('/staff/followup-items/', {
      plan: planRes.data.id,
      title: followup.title,
      due_date: followup.due_date || null,
      patient_visible: followup.patient_visible,
      patient_instructions: followup.patient_instructions,
    });
    setFollowup({ title: '', due_date: '', patient_instructions: '', patient_visible: true });
    setSaved(true);
  };

  if (loading) return <LoadingBox />;
  if (!visit) return <Typography color="error">{t('common.error')}</Typography>;

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t('visits.workspace')}
        subtitle={fmtDateTime(visit.visit_date)}
        action={
          <Stack direction="row" spacing={1}>
            <StatusChip status={visit.status} namespace="visits.statuses" />
            {visit.status !== 'completed' && (
              <>
                <Button variant="outlined" onClick={saveVisit}>{t('common.save')}</Button>
                <Button variant="contained" onClick={completeVisit}>{t('visits.complete')}</Button>
              </>
            )}
            <Button component={RouterLink} to="/dashboard/visits">{t('common.back')}</Button>
          </Stack>
        }
      />
      {saved && <Alert severity="success" onClose={() => setSaved(false)}>{t('common.saved')}</Alert>}

      <Tabs value={tab} onChange={(_, v) => setTab(v)}>
        <Tab label={t('visits.clinicalNotes')} />
        <Tab label={t('nav.prescriptions')} />
        <Tab label={t('nav.files')} />
        <Tab label={t('nav.followups')} />
      </Tabs>

      {tab === 0 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField label={t('visits.complaint')} value={form.chief_complaint}
                onChange={(e) => setForm({ ...form, chief_complaint: e.target.value })} fullWidth multiline rows={2} />
              <TextField label={t('visits.symptoms')} value={form.symptoms}
                onChange={(e) => setForm({ ...form, symptoms: e.target.value })} fullWidth multiline rows={2} />
              <TextField label={t('visits.treatment')} value={form.treatment}
                onChange={(e) => setForm({ ...form, treatment: e.target.value })} fullWidth multiline rows={2} />
              <TextField label={t('visits.instructions')} value={form.patient_instructions}
                onChange={(e) => setForm({ ...form, patient_instructions: e.target.value })} fullWidth multiline rows={2} />
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              {rxItems.map((item, idx) => (
                <Stack key={idx} direction={{ xs: 'column', md: 'row' }} spacing={1}>
                  <TextField label={t('prescriptions.medication')} value={item.medication_name}
                    onChange={(e) => { const n = [...rxItems]; n[idx].medication_name = e.target.value; setRxItems(n); }} fullWidth />
                  <TextField label={t('prescriptions.dosage')} value={item.dosage}
                    onChange={(e) => { const n = [...rxItems]; n[idx].dosage = e.target.value; setRxItems(n); }} />
                  <TextField label={t('prescriptions.frequency')} value={item.frequency}
                    onChange={(e) => { const n = [...rxItems]; n[idx].frequency = e.target.value; setRxItems(n); }} />
                  <TextField label={t('prescriptions.duration')} value={item.duration}
                    onChange={(e) => { const n = [...rxItems]; n[idx].duration = e.target.value; setRxItems(n); }} />
                </Stack>
              ))}
              <Stack direction="row" spacing={1}>
                <Button onClick={() => setRxItems([...rxItems, { medication_name: '', dosage: '', frequency: '', duration: '' }])}>
                  {t('prescriptions.addItem')}
                </Button>
                <Button variant="contained" onClick={createPrescription}>{t('prescriptions.issue')}</Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 2 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField select label={t('files.category')} value={fileForm.category}
                onChange={(e) => setFileForm({ ...fileForm, category: e.target.value })} fullWidth>
                <MenuItem value="report">{t('files.categories.report')}</MenuItem>
                <MenuItem value="lab">{t('files.categories.lab')}</MenuItem>
                <MenuItem value="imaging">{t('files.categories.imaging')}</MenuItem>
                <MenuItem value="other">{t('files.categories.other')}</MenuItem>
              </TextField>
              <TextField label={t('files.description')} value={fileForm.description}
                onChange={(e) => setFileForm({ ...fileForm, description: e.target.value })} fullWidth />
              <Button variant="contained" component="label">
                {t('files.upload')}
                <input type="file" hidden onChange={uploadFile} />
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {tab === 3 && (
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField label={t('followups.title')} value={followup.title}
                onChange={(e) => setFollowup({ ...followup, title: e.target.value })} fullWidth />
              <TextField type="date" label={t('followups.dueDate')} value={followup.due_date}
                onChange={(e) => setFollowup({ ...followup, due_date: e.target.value })}
                InputLabelProps={{ shrink: true }} fullWidth />
              <TextField label={t('followups.instructions')} value={followup.patient_instructions}
                onChange={(e) => setFollowup({ ...followup, patient_instructions: e.target.value })} fullWidth multiline rows={2} />
              <Button variant="contained" onClick={createFollowup}>{t('followups.create')}</Button>
            </Stack>
          </CardContent>
        </Card>
      )}
      <Divider />
    </Stack>
  );
}
