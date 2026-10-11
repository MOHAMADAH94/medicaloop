/** Quick dental procedures — Open Dental / Dentrix style shortcuts */
export const DENTAL_PROCEDURES = [
  { id: 'exam', label: 'كشف', labelEn: 'Exam', defaultStatus: 'completed' },
  { id: 'cleaning', label: 'تنظيف', labelEn: 'Cleaning', defaultStatus: 'completed' },
  { id: 'filling', label: 'حشو', labelEn: 'Filling', defaultStatus: 'planned' },
  { id: 'extraction', label: 'خلع', labelEn: 'Extraction', defaultStatus: 'planned' },
  { id: 'root_canal', label: 'علاج عصب', labelEn: 'Root canal', defaultStatus: 'in_progress' },
  { id: 'crown', label: 'تاج', labelEn: 'Crown', defaultStatus: 'planned' },
  { id: 'whitening', label: 'تبييض', labelEn: 'Whitening', defaultStatus: 'planned' },
  { id: 'ortho', label: 'تقويم', labelEn: 'Ortho consult', defaultStatus: 'planned' },
] as const;

export type ToothStatus = 'healthy' | 'planned' | 'in_progress' | 'completed' | 'selected';

export function toothStatusFromTreatments(
  toothNum: string,
  treatments: { tooth_number: string; status: string }[],
): ToothStatus {
  const related = treatments.filter((t) => t.tooth_number === toothNum);
  if (!related.length) return 'healthy';
  if (related.some((t) => t.status === 'in_progress')) return 'in_progress';
  if (related.some((t) => t.status === 'planned')) return 'planned';
  if (related.every((t) => t.status === 'completed')) return 'completed';
  return 'planned';
}

export const TOOTH_STATUS_COLORS: Record<ToothStatus, string> = {
  healthy: '#ECEFF1',
  planned: '#FFB74D',
  in_progress: '#4FC3F7',
  completed: '#81C784',
  selected: '#00838F',
};

export const TOOTH_STATUS_STROKE: Record<ToothStatus, string> = {
  healthy: '#B0BEC5',
  planned: '#F57C00',
  in_progress: '#0288D1',
  completed: '#388E3C',
  selected: '#004D40',
};
