import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import LoadingBox from '@/shared/components/LoadingBox';
import { usePermissions } from '@/shared/auth/PermissionsProvider';
import { hasAccessToken, readTokenPayload } from '@/shared/auth/tokens';

interface RequireAuthProps {
  children: ReactNode;
  userType: 'staff' | 'patient';
  permission?: string | string[];
}

export default function RequireAuth({ children, userType, permission }: RequireAuthProps) {
  const location = useLocation();
  const { can, loading } = usePermissions();

  if (!hasAccessToken()) {
    return <Navigate to="/auth" replace state={{ from: location.pathname }} />;
  }

  const payload = readTokenPayload();
  if (payload?.user_type && payload.user_type !== userType) {
    return <Navigate to={payload.user_type === 'patient' ? '/portal' : '/dashboard'} replace />;
  }

  if (userType === 'staff' && permission) {
    if (loading) return <LoadingBox />;
    if (!can(permission)) return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
