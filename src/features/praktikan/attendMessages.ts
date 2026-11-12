import type { AttendFailReason } from '@/types';

export const ATTEND_FAIL_MESSAGE: Record<AttendFailReason, string> = {
  SESSION_NOT_OPEN: 'Sesi tidak sedang dibuka',
  ALREADY_ATTENDED: 'Kamu sudah presensi pada sesi ini',
  INVALID_CODE: 'Kode sesi tidak sesuai',
  NOT_IN_CLASS: 'Sesi ini bukan untuk kelasmu',
  IZIN_APPROVED: 'Izinmu untuk sesi ini sudah disetujui',
  NO_CONNECTION: 'Tidak ada koneksi. Presensi memerlukan internet',
  TIMEOUT: 'Presensi belum dapat dipastikan. Cek tab Riwayat sebelum mencoba lagi',
  UNKNOWN: 'Terjadi kesalahan sistem saat presensi. Coba lagi nanti',
};
