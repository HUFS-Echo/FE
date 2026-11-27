export function displayDateRange(start: string, end: string): string {
  const shortDate = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}.${day}`;
  };
  return `${shortDate(start)}–${shortDate(end)}`;
}
