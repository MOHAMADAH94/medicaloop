import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LockIcon from '@mui/icons-material/Lock';
import { apiClient } from '@/shared/api/client';
import PageHeader from '@/shared/components/PageHeader';
import LoadingBox from '@/shared/components/LoadingBox';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { useToast } from '@/shared/feedback/ToastProvider';
import { extractApiError } from '@/shared/utils/errors';

interface Permission {
  id: string;
  codename: string;
  name: string;
  module: string;
}

interface Role {
  id: string;
  name: string;
  slug: string;
  description: string;
  is_system: boolean;
  permission_codenames: string[];
  member_count: number;
}

const EMPTY_ROLE = { name: '', slug: '', description: '', permission_codenames: [] as string[] };

export default function RolesPage() {
  const { t } = useTranslation();
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);
  const [form, setForm] = useState(EMPTY_ROLE);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Role | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([apiClient.get('/staff/roles/'), apiClient.get('/staff/permissions/')])
      .then(([rolesRes, permsRes]) => {
        setRoles(rolesRes.data ?? []);
        setPermissions(permsRes.data ?? []);
      })
      .catch((err) => toast.error(extractApiError(err, t('common.error'))))
      .finally(() => setLoading(false));
  }, [toast, t]);

  useEffect(load, [load]);

  const permissionsByModule = useMemo(() => {
    const grouped = new Map<string, Permission[]>();
    permissions.forEach((perm) => {
      const list = grouped.get(perm.module) ?? [];
      list.push(perm);
      grouped.set(perm.module, list);
    });
    return [...grouped.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [permissions]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_ROLE);
    setDialogOpen(true);
  };

  const openEdit = (role: Role) => {
    setEditing(role);
    setForm({
      name: role.name,
      slug: role.slug,
      description: role.description,
      permission_codenames: [...role.permission_codenames],
    });
    setDialogOpen(true);
  };

  const togglePermission = (codename: string) => {
    setForm((prev) => ({
      ...prev,
      permission_codenames: prev.permission_codenames.includes(codename)
        ? prev.permission_codenames.filter((c) => c !== codename)
        : [...prev.permission_codenames, codename],
    }));
  };

  const toggleModule = (perms: Permission[]) => {
    const codenames = perms.map((p) => p.codename);
    const allSelected = codenames.every((c) => form.permission_codenames.includes(c));
    setForm((prev) => ({
      ...prev,
      permission_codenames: allSelected
        ? prev.permission_codenames.filter((c) => !codenames.includes(c))
        : [...new Set([...prev.permission_codenames, ...codenames])],
    }));
  };

  const save = async () => {
    setSaving(true);
    try {
      if (editing) {
        await apiClient.patch(`/staff/roles/${editing.id}/`, form);
      } else {
        await apiClient.post('/staff/roles/', form);
      }
      toast.success(t('common.saved'));
      setDialogOpen(false);
      load();
    } catch (err) {
      toast.error(extractApiError(err, t('common.error')));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setSaving(true);
    try {
      await apiClient.delete(`/staff/roles/${pendingDelete.id}/`);
      toast.success(t('roles.deleted'));
      setPendingDelete(null);
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
        title={t('roles.title')}
        subtitle={t('roles.subtitle')}
        action={(
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t('roles.newRole')}
          </Button>
        )}
      />

      <Stack spacing={1.5}>
        {roles.map((role) => (
          <Paper key={role.id} sx={{ p: 2, borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box flex={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={700}>{role.name}</Typography>
                  {role.is_system ? (
                    <Chip size="small" icon={<LockIcon />} label={t('roles.systemRole')} />
                  ) : (
                    <Chip size="small" color="primary" variant="outlined" label={t('roles.customRole')} />
                  )}
                  <Chip size="small" variant="outlined" label={`${role.member_count} ${t('roles.members')}`} />
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {role.permission_codenames.length} {t('roles.permissionCount')}
                </Typography>
              </Box>
              <Stack direction="row">
                <Tooltip title={role.is_system ? t('roles.systemLocked') : t('common.edit')}>
                  <span>
                    <IconButton disabled={role.is_system} onClick={() => openEdit(role)}>
                      <EditIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title={role.is_system ? t('roles.systemLocked') : t('common.delete')}>
                  <span>
                    <IconButton color="error" disabled={role.is_system} onClick={() => setPendingDelete(role)}>
                      <DeleteOutlineIcon />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle fontWeight={700}>
          {editing ? t('roles.editRole') : t('roles.newRole')}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, mb: 2 }}>
            <TextField
              fullWidth required label={t('roles.name')} value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              fullWidth required label={t('roles.slug')} value={form.slug}
              helperText={t('roles.slugHint')}
              disabled={Boolean(editing)}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
            <TextField
              fullWidth multiline rows={2} label={t('roles.description')} value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Stack>

          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            {t('roles.permissions')} ({form.permission_codenames.length})
          </Typography>
          {permissionsByModule.map(([module, perms]) => {
            const selectedCount = perms.filter((p) => form.permission_codenames.includes(p.codename)).length;
            return (
              <Accordion key={module} disableGutters>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                    <Typography fontWeight={600}>{t(`roles.modules.${module}`, module)}</Typography>
                    <Chip size="small" label={`${selectedCount}/${perms.length}`} color={selectedCount ? 'primary' : 'default'} />
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Button size="small" onClick={() => toggleModule(perms)} sx={{ mb: 1 }}>
                    {t('roles.toggleAll')}
                  </Button>
                  <Stack>
                    {perms.map((perm) => (
                      <FormControlLabel
                        key={perm.codename}
                        control={(
                          <Checkbox
                            checked={form.permission_codenames.includes(perm.codename)}
                            onChange={() => togglePermission(perm.codename)}
                          />
                        )}
                        label={(
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body2">{perm.name}</Typography>
                            <Typography variant="caption" color="text.secondary">{perm.codename}</Typography>
                          </Stack>
                        )}
                      />
                    ))}
                  </Stack>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" onClick={save} disabled={saving || !form.name || !form.slug}>
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={t('roles.deleteRole')}
        message={t('roles.deleteConfirm', { name: pendingDelete?.name })}
        busy={saving}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </Stack>
  );
}
