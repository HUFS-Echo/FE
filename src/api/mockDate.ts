// Demo-only clock: real API servers determine publication state using the actual date.
export const DEMO_REFERENCE_DATE = '2026-11-20';

export const DEMO_WEEK_DATES: Record<number, { startDate: string; endDate: string }> = {
  1: { startDate: '2026-11-03', endDate: '2026-11-09' },
  2: { startDate: '2026-11-10', endDate: '2026-11-16' },
  3: { startDate: '2026-11-17', endDate: '2026-11-23' },
  4: { startDate: '2026-11-24', endDate: '2026-11-30' },
  5: { startDate: '2026-12-01', endDate: '2026-12-07' },
};

export function createRelativeMockTimestamp(daysAgo: number, time: string): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}
