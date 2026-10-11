import { useEffect, useState } from 'react';
import { apiClient } from '@/shared/api/client';
import { getSpecialtyConfig } from '@/shared/config/specialties';

export interface SpecialtyModule {
  code: string;
  name: string;
  name_ar: string;
  enabled: boolean;
  assignable?: boolean;
  active?: boolean;
}

export interface ClinicInfo {
  id?: string;
  name: string;
  slug?: string;
  specialty_code: string;
  specialty?: string;
  specialty_name?: string;
  specialty_modules?: SpecialtyModule[];
  branding?: {
    primary: string;
    primary_dark: string;
    secondary: string;
    accent: string;
    surface: string;
    gradient: string;
    tagline_ar: string;
    hero_ar: string;
  };
}

export function useClinicInfo() {
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/staff/clinic/')
      .then((res) => setClinic(res.data))
      .catch(() => setClinic(null))
      .finally(() => setLoading(false));
  }, []);

  const specialtyCode = clinic?.specialty_code ?? 'general';
  const isObgyn = specialtyCode === 'obgyn';
  const specialtyConfig = getSpecialtyConfig(specialtyCode);

  return { clinic, loading, specialtyCode, isObgyn, specialtyConfig };
}

export function useSpecialtyCatalog() {
  const [specialties, setSpecialties] = useState<SpecialtyModule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get('/specialties/catalog/', { params: { assignable: true } })
      .then((res) => setSpecialties(res.data.specialties || []))
      .catch(() => setSpecialties([]))
      .finally(() => setLoading(false));
  }, []);

  return { specialties, loading };
}
