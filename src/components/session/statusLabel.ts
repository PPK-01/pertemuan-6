import type { SessionStatus } from '@/types';

export const STATUS_LABEL = {
  scheduled: 'Dijadwalkan',
  open: 'Dibuka',
  closed: 'Ditutup',
} as const satisfies Record<SessionStatus, string>;
