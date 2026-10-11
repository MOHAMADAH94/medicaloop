import SpecialtyRecordsPage from '@/features/specialty/SpecialtyRecordsPage';
import { getSpecialtyConfig } from '@/shared/config/specialties';
import { Navigate } from 'react-router-dom';

interface Props {
  code: string;
}

export default function SpecialtyModulePage({ code }: Props) {
  const config = getSpecialtyConfig(code);
  if (!config || config.useDedicatedPage) {
    return <Navigate to="/dashboard" replace />;
  }
  return <SpecialtyRecordsPage config={config} />;
}
