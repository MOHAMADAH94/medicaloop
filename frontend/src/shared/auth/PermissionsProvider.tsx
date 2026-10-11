import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { apiClient } from '@/shared/api/client';
import { hasAccessToken } from '@/shared/auth/tokens';

interface PermissionsContextValue {
  permissions: Set<string>;
  loading: boolean;
  can: (codename?: string | string[]) => boolean;
  reload: () => void;
}

const PermissionsContext = createContext<PermissionsContextValue>({
  permissions: new Set(),
  loading: true,
  can: () => false,
  reload: () => {},
});

export function usePermissions() {
  return useContext(PermissionsContext);
}

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    if (!hasAccessToken()) {
      setPermissions(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    apiClient
      .get('/staff/my-permissions/')
      .then((res) => setPermissions(new Set<string>(res.data.permissions ?? [])))
      .catch(() => setPermissions(new Set()))
      .finally(() => setLoading(false));
  }, []);

  useEffect(reload, [reload]);

  const can = useCallback(
    (codename?: string | string[]) => {
      if (!codename) return true;
      const needed = Array.isArray(codename) ? codename : [codename];
      return needed.some((c) => permissions.has(c));
    },
    [permissions],
  );

  const value = useMemo(
    () => ({ permissions, loading, can, reload }),
    [permissions, loading, can, reload],
  );

  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
}
