import type { SessionStatus } from '@/types';

export type ColorPair = { bg: string; text: string };

// Warna bukan satu-satunya penanda status; badge wajib memuat teks label.
const status = {
  scheduled: { bg: '#FEF3C7', text: '#92400E' }, // amber: menunggu
  open: { bg: '#DCFCE7', text: '#166534' }, // hijau, sama dgn feedback.success
  closed: { bg: '#F1F5F9', text: '#334155' }, // abu; sengaja beda dari disabled.bg
} as const satisfies Record<SessionStatus, ColorPair>;

export const colors = {
  primary: '#4338CA', // kontras 7.9:1 dgn onPrimary; hue sengaja jauh dari hijau (status/sukses) & biru (info)
  onPrimary: '#FFFFFF',
  background: '#F8FAFC', // latar layar
  surface: '#FFFFFF', // latar Card, BottomSheet, input
  border: '#CBD5E1', // Card & divider (dekoratif)
  borderStrong: '#8492A6', // batas TextField & Chip belum terpilih; >= 3:1 thd background (batas komponen UI)
  text: '#0F172A',
  textMuted: '#475569', // teks sekunder; 7.2:1 thd background
  overlay: 'rgba(15, 23, 42, 0.5)', // backdrop BottomSheet
  disabled: { bg: '#E2E8F0', text: '#475569' },
  feedback: {
    success: { bg: '#DCFCE7', text: '#166534' },
    danger: { bg: '#FEE2E2', text: '#991B1B' },
    info: { bg: '#DBEAFE', text: '#1E40AF' },
  },
  status,
} as const;
