export type ValidationResult = {
  isValid: boolean;
  error?: string;
};

export function validateName(name: string): ValidationResult {
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    return { isValid: false, error: 'Nama minimal 2 karakter' };
  }
  if (trimmed.length > 50) {
    return { isValid: false, error: 'Nama maksimal 50 karakter' };
  }
  return { isValid: true };
}

export function validateEmail(email: string): ValidationResult {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email wajib diisi' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Format email tidak valid' };
  }
  return { isValid: true };
}

export function validatePassword(password: string): ValidationResult {
  if (password.length < 8) {
    return { isValid: false, error: 'Kata sandi minimal 8 karakter' };
  }
  return { isValid: true };
}

export function validateConfirmPassword(password: string, confirm: string): ValidationResult {
  if (password !== confirm) {
    return { isValid: false, error: 'Konfirmasi kata sandi tidak cocok' };
  }
  return { isValid: true };
}

export function validateInviteCode(code: string): ValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Kode undangan asisten wajib diisi' };
  }
  return { isValid: true };
}
