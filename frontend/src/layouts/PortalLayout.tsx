import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  AppBar,
  Badge,
  Box,
  BottomNavigation,
  BottomNavigationAction,
  IconButton,
  Toolbar,
  Typography,
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import EventIcon from '@mui/icons-material/Event';
import TimelineIcon from '@mui/icons-material/Timeline';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';

const navItems = [
  { path: '/portal', labelKey: 'nav.home', icon: <HomeIcon /> },
  { path: '/portal/appointments', labelKey: 'nav.appointments', icon: <EventIcon /> },
  { path: '/portal/timeline', labelKey: 'nav.timeline', icon: <TimelineIcon /> },
  { path: '/portal/profile', labelKey: 'nav.profile', icon: <PersonIcon /> },
];

export default function PortalLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  const currentIndex = navItems.findIndex(
    (item) => location.pathname === item.path || (item.path !== '/portal' && location.pathname.startsWith(item.path)),
  );

  useEffect(() => {
    apiClient.get('/patient/notifications/unread_count/')
      .then((res) => setUnread(res.data.count ?? 0))
      .catch(() => {});
  }, [location.pathname]);

  return (
    <Box sx={{ minHeight: '100vh', pb: 8, bgcolor: 'grey.50' }}>
      <AppBar position="sticky" elevation={0}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>{t('portal.title')}</Typography>
          <IconButton color="inherit" component={RouterLink} to="/portal/notifications">
            <Badge badgeContent={unread} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Toolbar>
      </AppBar>
      <Box sx={{ p: 2, maxWidth: 900, mx: 'auto' }}>
        <Outlet />
      </Box>
      <BottomNavigation
        showLabels
        value={currentIndex >= 0 ? currentIndex : 0}
        onChange={(_, v) => navigate(navItems[v].path)}
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, borderTop: 1, borderColor: 'divider' }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction key={item.path} label={t(item.labelKey)} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Box>
  );
}
