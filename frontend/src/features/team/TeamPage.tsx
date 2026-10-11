import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import EmptyState from '@/shared/components/EmptyState';
import LoadingBox from '@/shared/components/LoadingBox';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { useToast } from '@/shared/feedback/ToastProvider';
import { unwrapList } from '@/shared/utils/api';
import { fmtDate } from '@/shared/utils/format';
import { extractApiError } from '@/shared/utils/errors';

interface Role {
  id: string;
  name: string;
  slug: string;
  is_system: boolean;
}

interface Member {
  id: string;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  job_title: string;
  is_owner: boolean;
  is_active: boolean;
  role_details: Role[];
  created_at: string;
}

const EMPTY_INVITE = {
  username: '',
  password: '',
  first_name: '',
  last_name: '',
  phone: '',
  email: '',
  job_title: '',
  role_ids: [] as string[],
};

export default function TeamPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [members, setMembers] = useState<Member[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_INVITE);
  const [pendingRemoval, setPendingRemoval] = useState<Member | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiClient.get('/staff/team/'),
      apiClient.get('/staff/roles/'),
    ])
      .then(([teamRes, rolesRes]) => {
        setMembers(unwrapList(teamRes.data));
        setRoles(rolesRes.data ?? []);
      })
      .catch((err) => toast.error(extractApiError(err, t('common.error'))))
      .finally(() => setLoading(false));
  }, [toast, t]);

  useEffect(load, [load]);

  const activeCount = useMemo(() => members.filter((m) => m.is_active).length, [members]);

  const invite = async () => {
    setSaving(true);
    try {
      await apiClient.post('/staff/team/invite/', {
        ...form,
        email: form.email || undefined,
        password: form.password || undefined,
      });
      toast.success(t('team.inviteSuccess'));
      setInviteOpen(false);
      setForm(EMPTY_INVITE);
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('team.inviteFailed')));
    } finally {
      setSaving(false);
    }
  };

  const updateMember = async (member: Member, patch: Record<string, unknown>) => {
    try {
      await apiClient.patch(`/staff/team/${member.id}/`, patch);
      toast.success(t('common.saved'));
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('common.error')));
    }
  };

  const confirmRemoval = async () => {
    if (!pendingRemoval) return;
    setSaving(true);
    try {
      await apiClient.delete(`/staff/team/${pendingRemoval.id}/`);
      toast.success(t('team.deactivated'));
      setPendingRemoval(null);
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('common.error')));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingBox />;

  return (
    <Stack spacing={2}>
      <PageHeader
        title={t('team.title')}
        subtitle={t('team.subtitle')}
        action={(
          <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => setInviteOpen(true)}>
            {t('team.invite')}
          </Button>
        )}
      />

      <Stack direction="row" spacing={1}>
        <Chip color="primary" label={`${activeCount} ${t('team.activeMembers')}`} />
        <Chip variant="outlined" label={`${members.length - activeCount} ${t('team.inactiveMembers')}`} />
      </Stack>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('team.member')}</TableCell>
              <TableCell>{t('team.jobTitle')}</TableCell>
              <TableCell>{t('team.roles')}</TableCell>
              <TableCell>{t('team.joined')}</TableCell>
              <TableCell align="center">{t('team.active')}</TableCell>
              <TableCell align="center">{t('common.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}><EmptyState message={t('team.empty')} /></TableCell>
              </TableRow>
            ) : members.map((member) => (
              <TableRow key={member.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box>
                      <Typography fontWeight={700}>{member.full_name || member.username}</Typography>
                      <Typography variant="caption" color="text.secondary">@{member.username}</Typography>
                    </Box>
                    {member.is_owner && <Chip size="small" color="primary" label={t('team.owner')} />}
                  </Stack>
                </TableCell>
                <TableCell>{member.job_title || '—'}</TableCell>
                <TableCell sx={{ minWidth: 220 }}>
                  {member.is_owner ? (
                    <Typography variant="body2" color="text.secondary">{t('team.ownerAllAccess')}</Typography>
                  ) : (
                    <Select
                      multiple
                      size="small"
                      fullWidth
                      value={member.role_details.map((r) => r.id)}
                      onChange={(e) => updateMember(member, { role_ids: e.target.value })}
                      renderValue={(selected) => (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(selected as string[]).map((id) => (
                            <Chip key={id} size="small" label={roles.find((r) => r.id === id)?.name ?? id} />
                          ))}
                        </Stack>
                      )}
                    >
                      {roles.map((role) => (
                        <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                      ))}
                    </Select>
                  )}
                </TableCell>
                <TableCell>{fmtDate(member.created_at)}</TableCell>
                <TableCell align="center">
                  <Switch
                    checked={member.is_active}
                    disabled={member.is_owner}
                    onChange={(e) => updateMember(member, { is_active: e.target.checked })}
                  />
                </TableCell>
                <TableCell align="center">
                  <Tooltip title={member.is_owner ? t('team.ownerProtected') : t('team.deactivate')}>
                    <span>
                      <IconButton
                        color="error"
                        disabled={member.is_owner || !member.is_active}
                        onClick={() => setPendingRemoval(member)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={inviteOpen} onClose={() => setInviteOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>{t('team.invite')}</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {t('team.inviteHint')}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth required label={t('auth.username')} value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth type="password" label={t('auth.password')} value={form.password}
                helperText={t('team.passwordHint')}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label={t('auth.firstName')} value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label={t('auth.lastName')} value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label={t('patients.phone')} value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth label={t('team.jobTitle')} value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <Select
                multiple fullWidth displayEmpty size="small"
                value={form.role_ids}
                onChange={(e) => setForm({ ...form, role_ids: e.target.value as string[] })}
                renderValue={(selected) => (
                  selected.length === 0 ? t('team.selectRoles') : (
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {selected.map((id) => (
                        <Chip key={id} size="small" label={roles.find((r) => r.id === id)?.name ?? id} />
                      ))}
                    </Stack>
                  )
                )}
              >
                {roles.map((role) => (
                  <MenuItem key={role.id} value={role.id}>{role.name}</MenuItem>
                ))}
              </Select>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setInviteOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={invite} disabled={saving || form.username.length < 3}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingRemoval)}
        title={t('team.deactivate')}
        message={t('team.deactivateConfirm', { name: pendingRemoval?.full_name || pendingRemoval?.username })}
        confirmLabel={t('team.deactivate')}
        busy={saving}
        onConfirm={confirmRemoval}
        onCancel={() => setPendingRemoval(null)}
      />
    </Stack>
  );
}
