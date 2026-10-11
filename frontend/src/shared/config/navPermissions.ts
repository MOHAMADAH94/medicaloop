/** Permission required to reach each staff route. Undefined means "any clinic member". */
export const ROUTE_PERMISSIONS: Record<string, string | string[]> = {
  patients: 'patients.view',
  appointments: 'appointments.view',
  visits: 'medical_records.view',
  prescriptions: ['prescriptions.create', 'medical_records.view'],
  files: 'medical_records.view',
  followups: 'medical_records.view',
  billing: ['billing.view', 'billing.manage'],
  settings: 'settings.manage',
  team: 'staff.manage',
  roles: 'staff.manage',
  audit: 'staff.manage',
};

/** Specialty workspaces are gated by their own view permission. */
export function specialtyPermission(code: string): string {
  switch (code) {
    case 'obgyn':
      return 'obgyn.pregnancy.view';
    case 'pediatrics':
      return 'pediatrics.growth.view';
    case 'dental':
      return 'dental.treatment.view';
    case 'dermatology':
      return 'dermatology.case.view';
    case 'general':
      return 'general.care.view';
    default:
      return `${code}.record.view`;
  }
}
