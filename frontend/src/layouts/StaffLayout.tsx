import { useEffect, useMemo, useState } from 'react';
import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import EventIcon from '@mui/icons-material/Event';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MedicationIcon from '@mui/icons-material/Medication';
import FolderIcon from '@mui/icons-material/Folder';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import SettingsIcon from '@mui/icons-material/Settings';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupsIcon from '@mui/icons-material/Groups';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HistoryIcon from '@mui/icons-material/History';
import { apiClient } from '@/shared/api/client';
import { getSpecialtyNavItem } from '@/shared/config/specialties';
import { ROUTE_PERMISSIONS, specialtyPermission } from '@/shared/config/navPermissions';
import { useSpecialtyTheme } from '@/shared/theme/SpecialtyThemeProvider';
import { usePermissions } from '@/shared/auth/PermissionsProvider';
import { clearTokens } from '@/shared/auth/tokens';

const DRAWER_WIDTH = 280;

interface ClinicInfo {
  name: string;
  specialty: string;
  specialty_code: string;
  branding?: Record<string, string>;
}

interface NavItem {
  key: string;
  path: string;
  icon: React.ReactNode;
  permission?: string | string[];
}

export default function StaffLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { setSpecialtyContext } = useSpecialtyTheme();
  const { can } = usePermissions();
  const [unread, setUnread] = useState(0);
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo | null>(null);

  useEffect(() => {
    apiClient.get('/staff/clinic/').then((res) => {
      setClinicInfo({
        name: res.data.name,
        specialty: res.data.specialty || res.data.specialty_name || '',
        specialty_code: res.data.specialty_code || 'general',
        branding: res.data.branding,
      });
      setSpecialtyContext(res.data.specialty_code || 'general', res.data.branding);
    }).catch(() => {});
    apiClient.get('/staff/notifications/unread_count/')
      .then((res) => setUnread(res.data.count ?? 0))
      .catch(() => {});
  }, [location.pathname, setSpecialtyContext]);

  const navSections = useMemo(() => {
    const specialtyCode = clinicInfo?.specialty_code;
    const specialtyEntry = specialtyCode ? getSpecialtyNavItem(specialtyCode) : null;
    const specialtyItems: NavItem[] = specialtyEntry
      ? [{ ...specialtyEntry, permission: specialtyPermission(specialtyCode!) }]
      : [];

    const sections: { titleKey: string; items: NavItem[] }[] = [
      {
        titleKey: 'nav.sections.main',
        items: [
          { key: 'dashboard', path: '/dashboard', icon: <DashboardIcon /> },
          { key: 'appointments', path: '/dashboard/appointments', icon: <EventIcon />, permission: ROUTE_PERMISSIONS.appointments },
          { key: 'visits', path: '/dashboard/visits', icon: <MedicalServicesIcon />, permission: ROUTE_PERMISSIONS.visits },
          { key: 'patients', path: '/dashboard/patients', icon: <PeopleIcon />, permission: ROUTE_PERMISSIONS.patients },
        ],
      },
      {
        titleKey: 'nav.sections.clinical',
        items: [
          { key: 'prescriptions', path: '/dashboard/prescriptions', icon: <MedicationIcon />, permission: ROUTE_PERMISSIONS.prescriptions },
          { key: 'files', path: '/dashboard/files', icon: <FolderIcon />, permission: ROUTE_PERMISSIONS.files },
          { key: 'followups', path: '/dashboard/followups', icon: <AssignmentIcon />, permission: ROUTE_PERMISSIONS.followups },
        ],
      },
      { titleKey: 'nav.sections.specialty', items: specialtyItems },
      {
        titleKey: 'nav.sections.business',
        items: [{ key: 'billing', path: '/dashboard/billing', icon: <ReceiptIcon />, permission: ROUTE_PERMISSIONS.billing }],
      },
      {
        titleKey: 'nav.sections.administration',
        items: [
          { key: 'team', path: '/dashboard/team', icon: <GroupsIcon />, permission: ROUTE_PERMISSIONS.team },
          { key: 'roles', path: '/dashboard/roles', icon: <AdminPanelSettingsIcon />, permission: ROUTE_PERMISSIONS.roles },
          { key: 'audit', path: '/dashboard/audit', icon: <HistoryIcon />, permission: ROUTE_PERMISSIONS.audit },
        ],
      },
      {
        titleKey: 'nav.sections.system',
        items: [
          { key: 'settings', path: '/dashboard/settings', icon: <SettingsIcon />, permission: ROUTE_PERMISSIONS.settings },
          { key: 'notifications', path: '/dashboard/notifications', icon: <NotificationsIcon /> },
        ],
      },
    ];

    return sections
      .map((section) => ({ ...section, items: section.items.filter((item) => can(item.permission)) }))
      .filter((section) => section.items.length > 0);
  }, [clinicInfo?.specialty_code, can]);

  const handleLogout = () => {
    clearTokens();
    navigate('/auth');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>{t('app.name')}</Typography>
            {clinicInfo && (
              <Typography variant="caption" color="inherit" sx={{ opacity: 0.85 }}>
                {clinicInfo.name}{clinicInfo.specialty ? ` — ${clinicInfo.specialty}` : ''}
              </Typography>
            )}
          </Box>
          <IconButton color="inherit" component={RouterLink} to="/dashboard/notifications">
            <Badge badgeContent={unread} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout} sx={{ ml: 1 }}>
            {t('auth.logout')}
          </Button>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box', borderLeft: 0 },
        }}
      >
        <Toolbar />
        {navSections.map((section) => (
          <List key={section.titleKey} subheader={<ListSubheader>{t(section.titleKey)}</ListSubheader>}>
            {section.items.map((item) => (
              <ListItemButton
                key={item.key}
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={t(`nav.${item.key}`)} />
              </ListItemButton>
            ))}
            <Divider />
          </List>
        ))}
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, maxWidth: '100%' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
