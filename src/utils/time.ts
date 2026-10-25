const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function toDate(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTime(iso: string): string {
  const date = toDate(iso);
  return date ? timeFormatter.format(date) : '-';
}

export function formatDate(iso: string): string {
  const date = toDate(iso);
  return date ? dateFormatter.format(date) : '-';
}

export function formatDateTime(iso: string): string {
  const date = toDate(iso);
  return date ? `${dateFormatter.format(date)}, ${timeFormatter.format(date)}` : '-';
}
