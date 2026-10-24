import type { AttendFailReason } from '@/types';

export const ATTEND_FAIL_MESSAGE = {
  SESSION_NOT_OPEN: 'Sesi tidak sedang dibuka',
  ALREADY_ATTENDED: 'Kamu sudah presensi pada sesi ini',
  INVALID_CODE: 'Kode sesi tidak sesuai',
  NOT_IN_CLASS: 'Sesi ini bukan untuk kelasmu',
} as const satisfies Record<AttendFailReason, string>;
