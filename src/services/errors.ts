import type { ErrorCode } from '@/types';

export type AppError = {
  code: ErrorCode;
  message: string;
};

/**
 * Memetakan error Firebase / Jaringan / Sistem ke pesan ramah bahasa Indonesia (SRS 4.3).
 */
export function mapFirebaseError(error: unknown): AppError {
  if (!error || typeof error !== 'object') {
    return {
      code: 'UNKNOWN',
      message: 'Terjadi kesalahan tidak terduga. Silakan coba lagi.',
    };
  }

  const err = error as { code?: string; message?: string; name?: string };
  const errorCode = err.code ?? '';
  const errorMessage = err.message ?? '';

  // Auth Errors
  if (
    errorCode === 'auth/invalid-credential' ||
    errorCode === 'auth/wrong-password' ||
    errorCode === 'auth/user-not-found'
  ) {
    return {
      code: 'INVALID_INPUT',
      message: 'Email atau kata sandi salah',
    };
  }

  if (errorCode === 'auth/email-already-in-use') {
    return {
      code: 'CONFLICT',
      message: 'Email sudah terdaftar',
    };
  }

  if (errorCode === 'auth/weak-password') {
    return {
      code: 'INVALID_INPUT',
      message: 'Kata sandi terlalu lemah (minimal 8 karakter)',
    };
  }

  if (errorCode === 'auth/invalid-email') {
    return {
      code: 'INVALID_INPUT',
      message: 'Format email tidak valid',
    };
  }

  if (errorCode === 'auth/too-many-requests') {
    return {
      code: 'UNKNOWN',
      message: 'Terlalu banyak percobaan, coba lagi nanti',
    };
  }

  // Network & Timeout
  if (
    errorCode === 'unavailable' ||
    errorCode === 'network-request-failed' ||
    errorMessage.toLowerCase().includes('network') ||
    errorMessage.toLowerCase().includes('offline')
  ) {
    return {
      code: 'NO_CONNECTION',
      message: 'Tidak ada koneksi internet',
    };
  }

  if (err.name === 'AbortError' || errorCode === 'deadline-exceeded' || errorMessage.includes('timeout')) {
    return {
      code: 'TIMEOUT',
      message: 'Permintaan terlalu lama. Periksa koneksi lalu coba lagi',
    };
  }

  // Firestore Permission & Conflict
  if (errorCode === 'permission-denied') {
    return {
      code: 'PERMISSION_DENIED',
      message: 'Kamu tidak memiliki izin untuk aksi ini atau kode undangan tidak sesuai',
    };
  }

  if (errorCode === 'not-found') {
    return {
      code: 'NOT_FOUND',
      message: 'Data tidak ditemukan',
    };
  }

  if (errorCode === 'already-exists') {
    return {
      code: 'CONFLICT',
      message: 'Data sudah ada atau telah diproses sebelumnya',
    };
  }

  return {
    code: 'UNKNOWN',
    message: err.message || 'Terjadi kesalahan pada server. Coba beberapa saat lagi.',
  };
}
