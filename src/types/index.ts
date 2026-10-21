// ===== Daftar + tipe turunan =====
// Satu sumber untuk tipe dan pilihan di UI.

/** Daftar kelas praktikum. */
export const KELAS_LIST = ['A', 'B'] as const;
export type Kelas = (typeof KELAS_LIST)[number];

/** Daftar mata praktikum. */
export const PRAKTIKUM_LIST = ['Pemrograman Mobile', 'Basis Data'] as const;
export type Praktikum = (typeof PRAKTIKUM_LIST)[number];

/** Daftar status sesi. Urutan dipakai chip filter. */
export const SESSION_STATUS_LIST = ['scheduled', 'open', 'closed'] as const;
export type SessionStatus = (typeof SESSION_STATUS_LIST)[number];

export type Role = 'praktikan' | 'asisten';

// ===== Entitas =====

export type User = {
  id: string;
  name: string;
  role: Role;
  /** Hanya diisi untuk praktikan. */
  kelas?: Kelas;
};

export type Session = {
  id: string;
  praktikum: Praktikum;
  kelas: Kelas;
  topik: string;
  ruang: string;
  /** ISO 8601 hasil toISOString() (UTC); ditampilkan dalam waktu lokal oleh formatter di utils/time.ts. */
  startAt: string;
  /** ISO 8601 hasil toISOString() (UTC); ditampilkan dalam waktu lokal oleh formatter di utils/time.ts. */
  endAt: string;
  /** Status awal selalu 'scheduled'; transisi scheduled -> open -> closed hanya lewat store. */
  status: SessionStatus;
  /**
   * 4 digit sebagai string (mis. '0427') agar nol di depan terjaga.
   * Dibuat store saat createSession; UI asisten hanya menampilkannya saat status 'open'.
   */
  code: string;
  /** id User asisten pembuat. */
  createdBy: string;
  /** ISO 8601 hasil toISOString() (UTC); ditampilkan dalam waktu lokal oleh formatter di utils/time.ts. */
  openedAt?: string;
  /** ISO 8601 hasil toISOString() (UTC); ditampilkan dalam waktu lokal oleh formatter di utils/time.ts. */
  closedAt?: string;
};

export type Attendance = {
  id: string;
  sessionId: string;
  userId: string;
  /** ISO 8601 (UTC). */
  timestamp: string;
};

// ===== Hasil presensi =====

export type AttendFailReason =
  | 'SESSION_NOT_OPEN'
  | 'ALREADY_ATTENDED'
  | 'INVALID_CODE'
  | 'NOT_IN_CLASS';

export type AttendResult =
  | { ok: true; attendance: Attendance }
  | { ok: false; reason: AttendFailReason };

// ===== Rekap (FR-10) =====

export type Rekap = {
  /** Jumlah praktikan di kelas sesi. */
  total: number;
  /** Urut timestamp, paling awal di atas. */
  hadir: { user: User; timestamp: string }[];
  /** Urut nama (alfabetis). */
  belumHadir: User[];
};

// ===== Input store =====

/**
 * id, status, code, openedAt, closedAt dibuat oleh store.
 * startAt/endAt sudah berupa ISO; parsing & validasi teks tanggal/jam dilakukan form asisten.
 */
export type CreateSessionInput = Pick<
  Session,
  'praktikum' | 'kelas' | 'topik' | 'ruang' | 'startAt' | 'endAt' | 'createdBy'
>;
