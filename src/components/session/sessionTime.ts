import type { Session } from '@/types';
import { formatDate, formatTime } from '@/utils/time';

/** Format waktu sesi yang sama di SessionInfo dan SessionCard, mis. "23 Okt 2026 · 09.00–11.00". */
export function formatSessionTime({ startAt, endAt }: Pick<Session, 'startAt' | 'endAt'>): string {
  return `${formatDate(startAt)} · ${formatTime(startAt)}–${formatTime(endAt)}`;
}
