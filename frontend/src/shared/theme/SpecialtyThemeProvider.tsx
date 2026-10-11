import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ThemeProvider } from '@mui/material';
import { apiClient } from '@/shared/api/client';
import {
  createAppTheme,
  DEFAULT_BRANDING,
  resolveBranding,
  type SpecialtyBranding,
} from '@/theme';

interface SpecialtyThemeContextValue {
  specialtyCode: string;
  branding: SpecialtyBranding;
  setSpecialtyContext: (code: string, branding?: Partial<SpecialtyBranding> | null) => void;
}

const SpecialtyThemeContext = createContext<SpecialtyThemeContextValue>({
  specialtyCode: 'general',
  branding: DEFAULT_BRANDING,
  setSpecialtyContext: () => {},
});

export function useSpecialtyTheme() {
  return useContext(SpecialtyThemeContext);
}

export function SpecialtyThemeProvider({ children }: { children: ReactNode }) {
  const [specialtyCode, setSpecialtyCode] = useState('general');
  const [apiBranding, setApiBranding] = useState<Partial<SpecialtyBranding> | null>(null);

  const branding = useMemo(
    () => resolveBranding(specialtyCode, apiBranding),
    [specialtyCode, apiBranding],
  );
  const theme = useMemo(() => createAppTheme(branding), [branding]);

  const setSpecialtyContext = useCallback(
    (code: string, brandingOverride?: Partial<SpecialtyBranding> | null) => {
      setSpecialtyCode(code || 'general');
      if (brandingOverride !== undefined) {
        setApiBranding(brandingOverride);
      }
    },
    [],
  );

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    apiClient.get('/staff/clinic/')
      .then((res) => {
        setSpecialtyCode(res.data.specialty_code || 'general');
        setApiBranding(res.data.branding || null);
      })
      .catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ specialtyCode, branding, setSpecialtyContext }),
    [specialtyCode, branding, setSpecialtyContext],
  );

  return (
    <SpecialtyThemeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </SpecialtyThemeContext.Provider>
  );
}
