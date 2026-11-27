// Demo-only clock: real API servers determine publication state using the actual date.
export const DEMO_REFERENCE_DATE = '2026-11-20';

export const DEMO_WEEK_DATES: Record<number, { startDate: string; endDate: string }> = {
  1: { startDate: '2026-11-03', endDate: '2026-11-09' },
  2: { startDate: '2026-11-10', endDate: '2026-11-16' },
  3: { startDate: '2026-11-17', endDate: '2026-11-23' },
  4: { startDate: '2026-11-24', endDate: '2026-11-30' },
  5: { startDate: '2026-12-01', endDate: '2026-12-07' },
  6: { startDate: '2026-12-08', endDate: '2026-12-14' },
  7: { startDate: '2026-12-15', endDate: '2026-12-21' },
  8: { startDate: '2026-12-22', endDate: '2026-12-28' },
  9: { startDate: '2026-12-29', endDate: '2027-01-04' },
  10: { startDate: '2027-01-05', endDate: '2027-01-11' },
  11: { startDate: '2027-01-12', endDate: '2027-01-18' },
  12: { startDate: '2027-01-19', endDate: '2027-01-25' },
  13: { startDate: '2027-01-26', endDate: '2027-02-01' },
  14: { startDate: '2027-02-02', endDate: '2027-02-08' },
  15: { startDate: '2027-02-09', endDate: '2027-02-15' },
};

export function createRelativeMockTimestamp(daysAgo: number, time: string): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  const [hours, minutes] = time.split(':').map(Number);
  date.setHours(hours, minutes, 0, 0);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
}
