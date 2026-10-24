import type { CreateSessionInput, Kelas, Praktikum } from '@/types';

export type SessionFormValues = {
  praktikum: Praktikum | null;
  kelas: Kelas | null;
  topik: string;
  ruang: string;
  /** DD/MM/YYYY; pemisah '/', '-', atau '.'. */
  tanggal: string;
  /** HH.MM 24 jam; pemisah '.' atau ':'. */
  jamMulai: string;
  /** HH.MM 24 jam; pemisah '.' atau ':'. */
  jamSelesai: string;
};

export type SessionFormErrors = Partial<Record<keyof SessionFormValues, string>>;

export type SessionFormResult =
  | { ok: true; input: Omit<CreateSessionInput, 'createdBy'> }
  | { ok: false; errors: SessionFormErrors };

type Parsed<T> = { ok: true; value: T } | { ok: false; error: string };

type DateParts = { year: number; month: number; day: number };
type TimeParts = { hour: number; minute: number };

const DATE_PATTERN = /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/;
const TIME_PATTERN = /^(\d{1,2})[.:](\d{2})$/;

function parseDate(text: string): Parsed<DateParts> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: 'Tanggal wajib diisi' };

  const match = DATE_PATTERN.exec(trimmed);
  if (!match) return { ok: false, error: 'Gunakan format DD/MM/YYYY' };

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  // Date menggeser tanggal yang melimpah (31/02 menjadi 03/03), jadi komponennya dicek ulang.
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  if (!valid) return { ok: false, error: 'Tanggal tidak valid' };

  return { ok: true, value: { year, month, day } };
}

function parseTime(text: string): Parsed<TimeParts> {
  const trimmed = text.trim();
  if (!trimmed) return { ok: false, error: 'Jam wajib diisi' };

  const match = TIME_PATTERN.exec(trimmed);
  if (!match) return { ok: false, error: 'Gunakan format HH.MM' };

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return { ok: false, error: 'Jam tidak valid' };

  return { ok: true, value: { hour, minute } };
}

function toIso({ year, month, day }: DateParts, { hour, minute }: TimeParts): string {
  // Waktu lokal perangkat, disimpan sebagai ISO UTC (SRS §3).
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

export function validateSessionForm(values: SessionFormValues): SessionFormResult {
  const errors: SessionFormErrors = {};
  const topik = values.topik.trim();
  const ruang = values.ruang.trim();

  if (!values.praktikum) errors.praktikum = 'Pilih praktikum';
  if (!values.kelas) errors.kelas = 'Pilih kelas';
  if (!topik) errors.topik = 'Topik wajib diisi';
  if (!ruang) errors.ruang = 'Ruang wajib diisi';

  const tanggal = parseDate(values.tanggal);
  if (!tanggal.ok) errors.tanggal = tanggal.error;

  const jamMulai = parseTime(values.jamMulai);
  if (!jamMulai.ok) errors.jamMulai = jamMulai.error;

  const jamSelesai = parseTime(values.jamSelesai);
  if (!jamSelesai.ok) {
    errors.jamSelesai = jamSelesai.error;
  } else if (jamMulai.ok) {
    const start = jamMulai.value.hour * 60 + jamMulai.value.minute;
    const end = jamSelesai.value.hour * 60 + jamSelesai.value.minute;
    if (end <= start) errors.jamSelesai = 'Jam selesai harus setelah jam mulai';
  }

  if (
    !values.praktikum ||
    !values.kelas ||
    !tanggal.ok ||
    !jamMulai.ok ||
    !jamSelesai.ok ||
    Object.keys(errors).length > 0
  ) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    input: {
      praktikum: values.praktikum,
      kelas: values.kelas,
      topik,
      ruang,
      startAt: toIso(tanggal.value, jamMulai.value),
      endAt: toIso(tanggal.value, jamSelesai.value),
    },
  };
}

/** DD/MM/YYYY dalam waktu lokal, untuk mengisi tanggal awal form. */
export function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${date.getFullYear()}`;
}
