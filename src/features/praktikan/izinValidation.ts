export type IzinValidationResult = {
  isValid: boolean;
  sanitizedAlasan: string;
  error?: string;
};

/**
 * Validasi alasan izin sesuai SRS Bagian 4.2:
 * Setelah dipangkas dan spasi berlebih diringkas: 10–500 karakter, memuat minimal satu huruf; karakter kontrol dibuang.
 */
export function validateAlasanIzin(rawText: string): IzinValidationResult {
  // 1. Buang karakter kontrol (ASCII 0-31 kecuali newline)
  // eslint-disable-next-line no-control-regex
  const stripped = rawText.replace(/[\x00-\x09\x0B-\x1F\x7F]/g, '');

  // 2. Ringkas spasi berlebih
  const normalized = stripped.replace(/[ \t]+/g, ' ').trim();

  // 3. Cek apakah memuat minimal satu huruf
  if (!/[a-zA-Z]/.test(normalized)) {
    return {
      isValid: false,
      sanitizedAlasan: normalized,
      error: 'Alasan izin harus memuat setidaknya satu huruf alfabet.',
    };
  }

  // 4. Cek panjang karakter
  if (normalized.length < 10) {
    return {
      isValid: false,
      sanitizedAlasan: normalized,
      error: `Alasan terlalu singkat (minimal 10 karakter, saat ini ${normalized.length}).`,
    };
  }

  if (normalized.length > 500) {
    return {
      isValid: false,
      sanitizedAlasan: normalized,
      error: `Alasan melebihi batas maksimal 500 karakter (saat ini ${normalized.length}).`,
    };
  }

  return {
    isValid: true,
    sanitizedAlasan: normalized,
  };
}
