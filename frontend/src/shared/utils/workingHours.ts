/** Backend uses Python weekday: 0=Monday … 6=Sunday */
export const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export interface WorkingHour {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active?: boolean;
}

export function formatTime(time: string): string {
  return time.slice(0, 5);
}

export function groupWorkingHoursByDay(hours: WorkingHour[]): Map<number, WorkingHour[]> {
  const map = new Map<number, WorkingHour[]>();
  for (const h of hours.filter((x) => x.is_active !== false)) {
    const list = map.get(h.day_of_week) ?? [];
    list.push(h);
    map.set(h.day_of_week, list);
  }
  return map;
}

export function isWorkingDay(dateStr: string, workingDays: number[]): boolean {
  const d = new Date(`${dateStr}T12:00:00`);
  const weekday = (d.getDay() + 6) % 7; // convert JS Sun=0 to Mon=0
  return workingDays.includes(weekday);
}
