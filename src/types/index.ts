// ===== Tipe Domain Rawuh - Sprint 2 =====

export type Role = 'praktikan' | 'asisten';
export type Kelas = string;
export type Praktikum = string;

/** @deprecated Sumber pilihan form Sprint 2 kini berasal dari useKelasList() */
export const KELAS_LIST = ['A', 'B'] as const;
/** @deprecated Sumber pilihan form Sprint 2 kini berasal dari useKelasList() */
export const PRAKTIKUM_LIST = ['Pemrograman Mobile', 'Basis Data'] as const;

/** Daftar status sesi praktikum. */
export const SESSION_STATUS_LIST = ['scheduled', 'open', 'closed'] as const;
export type SessionStatus = (typeof SESSION_STATUS_LIST)[number];

/** Daftar status izin. */
export const IZIN_STATUS_LIST = [
  'pending_ai',
  'pending_review',
  'approved',
  'rejected',
] as const;
export type IzinStatus = (typeof IZIN_STATUS_LIST)[number];

/** Daftar kategori analisis izin AI. */
export const IZIN_KATEGORI_LIST = [
  'sakit',
  'keluarga',
  'akademik',
  'lainnya',
  'tidak_jelas',
] as const;
export type IzinKategori = (typeof IZIN_KATEGORI_LIST)[number];

// ===== Entitas =====

export type User = {
  id: string; // Firebase Auth uid
  name: string;
  email: string;
  role: Role;
  /** Hanya diisi untuk praktikan. */
  kelas?: Kelas;
};

export type KelasPraktikum = {
  id: string;
  praktikum: string;
  kelas: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Session = {
  id: string;
  praktikum: Praktikum;
  kelas: Kelas;
  topik: string;
  ruang: string;
  /** ISO 8601 (UTC). */
  startAt: string;
  /** ISO 8601 (UTC). */
  endAt: string;
  status: SessionStatus;
  /** id User asisten pembuat. */
  createdBy: string;
  openedAt?: string;
  closedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  /** @deprecated Catatan: field `code` dipindah ke subdokumen private/code di server */
  code?: string;
};

export type Attendance = {
  id: string; // ${sessionId}_${userId}
  sessionId: string;
  userId: string;
  kelas?: string;
  code?: string;
  timestamp: string; // ISO 8601 (UTC)
};

// ===== Analisis AI & Review Izin =====

export type AiErrorCode =
  | 'NOT_CONFIGURED'
  | 'NETWORK'
  | 'TIMEOUT'
  | 'HTTP_ERROR'
  | 'RATE_LIMIT'
  | 'INVALID_RESPONSE';

export type AiResult =
  | {
      state: 'success';
      keputusan: 'diterima' | 'ditolak';
      kategori: IzinKategori;
      alasan: string; // penjelasan singkat AI
      at: string;
    }
  | {
      state: 'failed';
      errorCode: AiErrorCode;
      at: string;
    };

export type IzinReview = {
  keputusan: 'approved' | 'rejected';
  catatan?: string;
  reviewedBy: string;
  reviewedAt: string;
};

export type Izin = {
  id: string; // ${sessionId}_${userId}
  sessionId: string;
  userId: string;
  userName: string;
  kelas: string;
  alasan: string;
  status: IzinStatus;
  ai?: AiResult;
  review?: IzinReview;
  createdAt: string;
  updatedAt: string;
};

// ===== Rekap (FR-10, FR-28) =====

export type Rekap = {
  total: number;
  /** Urut timestamp kehadiran paling awal di atas. */
  hadir: { user: User; timestamp: string }[];
  /** Hanya izin berstatus approved, diurutkan menurut nama user. */
  izin: { user: User; izin: Izin }[];
  /** Diurutkan menurut nama; tidak memuat yang hadir atau izin disetujui. */
  belumHadir: User[];
};

// ===== Hasil Operasi & Error Handlers =====

export type ErrorCode =
  | 'NO_CONNECTION'
  | 'TIMEOUT'
  | 'PERMISSION_DENIED'
  | 'NOT_FOUND'
  | 'INVALID_INPUT'
  | 'CONFLICT'
  | 'UNKNOWN';

export type Result<T = void> =
  | { ok: true; data: T }
  | { ok: false; code: ErrorCode; message: string };

export type AttendFailReason =
  | 'SESSION_NOT_OPEN'
  | 'ALREADY_ATTENDED'
  | 'INVALID_CODE'
  | 'NOT_IN_CLASS'
  | 'IZIN_APPROVED'
  | 'NO_CONNECTION'
  | 'TIMEOUT'
  | 'UNKNOWN';

export type AttendResult =
  | { ok: true; attendance: Attendance }
  | { ok: false; reason: AttendFailReason };

// ===== Input Forms =====

export type CreateSessionInput = {
  praktikum: string;
  kelas: string;
  topik: string;
  ruang: string;
  startAt: string;
  endAt: string;
  createdBy: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
  kelas?: string;
  inviteCode?: string;
};
