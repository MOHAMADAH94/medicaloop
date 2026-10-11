import GenericSpecialtyPage from '@/features/clinical/GenericSpecialtyPage';
import { getCatalogEntry } from '@/shared/config/specialtyCatalog';
import { Navigate } from 'react-router-dom';

export default function ClinicalSpecialtyPage({ code }: { code: string }) {
  const config = getCatalogEntry(code);
  if (!config || config.workspace !== 'clinical') {
    return <Navigate to="/dashboard" replace />;
  }
  return <GenericSpecialtyPage config={config} />;
}
