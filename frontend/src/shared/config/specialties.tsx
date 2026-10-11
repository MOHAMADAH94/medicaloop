import type { ReactElement } from 'react';
import {
  getCatalogEntry,
  getSpecialtyNavItem,
  SPECIALTY_CATALOG,
  SPECIALTY_CATALOG_MAP,
} from '@/shared/config/specialtyCatalog';

export type FieldType = 'text' | 'number' | 'date' | 'textarea' | 'select' | 'patient';

export interface FormFieldConfig {
  name: string;
  labelKey: string;
  type: FieldType;
  required?: boolean;
  options?: { value: string; labelKey: string }[];
}

export interface ColumnConfig {
  field: string;
  labelKey: string;
  format?: 'date' | 'status';
}

export interface SpecialtyUiConfig {
  code: string;
  navKey: string;
  path: string;
  apiPath: string;
  titleKey: string;
  subtitleKey: string;
  newKey: string;
  emptyKey: string;
  icon: ReactElement;
  columns: ColumnConfig[];
  formFields: FormFieldConfig[];
  useDedicatedPage?: boolean;
}

function catalogToUi(entry: typeof SPECIALTY_CATALOG[number]): SpecialtyUiConfig {
  return {
    code: entry.code,
    navKey: entry.navKey,
    path: entry.path,
    apiPath: entry.apiPath,
    titleKey: entry.titleKey,
    subtitleKey: entry.subtitleKey,
    newKey: entry.newKey,
    emptyKey: entry.emptyKey,
    icon: entry.icon,
    columns: [],
    formFields: [],
    useDedicatedPage: entry.workspace !== 'clinical',
  };
}

export const SPECIALTY_CONFIGS: Record<string, SpecialtyUiConfig> = Object.fromEntries(
  SPECIALTY_CATALOG.map((e) => [e.code, catalogToUi(e)]),
);

export function getSpecialtyConfig(code: string): SpecialtyUiConfig | undefined {
  return SPECIALTY_CONFIGS[code] || (getCatalogEntry(code) ? catalogToUi(getCatalogEntry(code)!) : undefined);
}

export { getSpecialtyNavItem, SPECIALTY_CATALOG, SPECIALTY_CATALOG_MAP };
