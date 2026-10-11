import ChildCareIcon from '@mui/icons-material/ChildCare';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HearingIcon from '@mui/icons-material/Hearing';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import OpacityIcon from '@mui/icons-material/Opacity';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PregnantWomanIcon from '@mui/icons-material/PregnantWoman';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SpaIcon from '@mui/icons-material/Spa';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AirIcon from '@mui/icons-material/Air';
import BiotechIcon from '@mui/icons-material/Biotech';
import AccessibleIcon from '@mui/icons-material/Accessible';
import type { ReactElement } from 'react';

export type WorkspaceType = 'dental' | 'obgyn' | 'pediatrics' | 'dermatology' | 'general' | 'clinical';

export interface SpecialtyCatalogEntry {
  code: string;
  navKey: string;
  path: string;
  apiPath: string;
  titleKey: string;
  subtitleKey: string;
  newKey: string;
  emptyKey: string;
  icon: ReactElement;
  workspace: WorkspaceType;
  category: 'primary' | 'extended';
}

const clinical = (code: string, navKey: string, titleKey: string): SpecialtyCatalogEntry => ({
  code,
  navKey,
  path: `/dashboard/${code}`,
  apiPath: `/staff/${code}/records/`,
  titleKey,
  subtitleKey: `${code}.subtitle`,
  newKey: `${code}.newRecord`,
  emptyKey: `${code}.empty`,
  icon: <LocalHospitalIcon />,
  workspace: 'clinical',
  category: 'extended',
});

export const SPECIALTY_CATALOG: SpecialtyCatalogEntry[] = [
  { code: 'obgyn', navKey: 'obgyn', path: '/dashboard/obgyn', apiPath: '/staff/obgyn/pregnancies/', titleKey: 'obgyn.title', subtitleKey: 'obgyn.subtitle', newKey: 'obgyn.newPregnancy', emptyKey: 'obgyn.empty', icon: <PregnantWomanIcon />, workspace: 'obgyn', category: 'primary' },
  { code: 'pediatrics', navKey: 'pediatrics', path: '/dashboard/pediatrics', apiPath: '/staff/pediatrics/growth-records/', titleKey: 'pediatrics.title', subtitleKey: 'pediatrics.subtitle', newKey: 'pediatrics.newRecord', emptyKey: 'pediatrics.empty', icon: <ChildCareIcon />, workspace: 'pediatrics', category: 'primary' },
  { code: 'dental', navKey: 'dental', path: '/dashboard/dental', apiPath: '/staff/dental/treatments/', titleKey: 'dental.title', subtitleKey: 'dental.subtitle', newKey: 'dental.newTreatment', emptyKey: 'dental.empty', icon: <MedicalServicesIcon />, workspace: 'dental', category: 'primary' },
  { code: 'dermatology', navKey: 'dermatology', path: '/dashboard/dermatology', apiPath: '/staff/dermatology/cases/', titleKey: 'dermatology.title', subtitleKey: 'dermatology.subtitle', newKey: 'dermatology.newCase', emptyKey: 'dermatology.empty', icon: <SpaIcon />, workspace: 'dermatology', category: 'primary' },
  { code: 'general', navKey: 'generalCare', path: '/dashboard/general-care', apiPath: '/staff/general/care-plans/', titleKey: 'generalCare.title', subtitleKey: 'generalCare.subtitle', newKey: 'generalCare.newPlan', emptyKey: 'generalCare.empty', icon: <LocalHospitalIcon />, workspace: 'general', category: 'primary' },
  { ...clinical('cardiology', 'cardiology', 'cardiology.title'), icon: <FavoriteIcon /> },
  { ...clinical('ophthalmology', 'ophthalmology', 'ophthalmology.title'), icon: <VisibilityIcon /> },
  { ...clinical('orthopedics', 'orthopedics', 'orthopedics.title'), icon: <AccessibleIcon /> },
  { ...clinical('ent', 'ent', 'ent.title'), icon: <HearingIcon /> },
  { ...clinical('psychiatry', 'psychiatry', 'psychiatry.title'), icon: <PsychologyIcon /> },
  { ...clinical('gastroenterology', 'gastroenterology', 'gastroenterology.title'), icon: <BiotechIcon /> },
  { ...clinical('neurology', 'neurology', 'neurology.title'), icon: <MonitorHeartIcon /> },
  { ...clinical('pulmonology', 'pulmonology', 'pulmonology.title'), icon: <AirIcon /> },
  { ...clinical('urology', 'urology', 'urology.title'), icon: <OpacityIcon /> },
  { ...clinical('endocrinology', 'endocrinology', 'endocrinology.title'), icon: <BiotechIcon /> },
  { ...clinical('nutrition', 'nutrition', 'nutrition.title'), icon: <RestaurantIcon /> },
  { ...clinical('physiotherapy', 'physiotherapy', 'physiotherapy.title'), icon: <FitnessCenterIcon /> },
];

export const SPECIALTY_CATALOG_MAP = Object.fromEntries(
  SPECIALTY_CATALOG.map((e) => [e.code, e]),
) as Record<string, SpecialtyCatalogEntry>;

export function getCatalogEntry(code: string): SpecialtyCatalogEntry | undefined {
  return SPECIALTY_CATALOG_MAP[code];
}

export function getSpecialtyNavItem(code: string) {
  const entry = getCatalogEntry(code);
  if (!entry) return null;
  return { key: entry.navKey, path: entry.path, icon: entry.icon };
}

/** Route path segment (without /dashboard/) */
export function routePathFor(code: string): string {
  const entry = getCatalogEntry(code);
  if (!entry) return code;
  return entry.path.replace('/dashboard/', '');
}
