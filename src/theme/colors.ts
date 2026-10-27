import type { SessionStatus } from '@/types';

export type ColorPair = { bg: string; text: string };

const status = {
  scheduled: { bg: '#FFF1C2', text: '#5E3B00' },
  open: { bg: '#DDF1E4', text: '#14603A' },
  closed: { bg: '#E3E7F2', text: '#3A4560' },
} as const satisfies Record<SessionStatus, ColorPair>;

export const colors = {
  primary: '#00144A',
  onPrimary: '#FFFFFF',
  accent: '#FFC400',
  onAccent: '#00144A',
  tile: '#E3E7F2',
  background: '#F4F6FB',
  surface: '#FFFFFF',
  border: '#D5DAE8',
  borderStrong: '#7A84A0',
  text: '#0E1633',
  textMuted: '#4B5675',
  overlay: 'rgba(0, 20, 74, 0.5)',
  disabled: { bg: '#E3E7F2', text: '#66708C' },
  feedback: {
    success: { bg: '#DDF1E4', text: '#14603A' },
    danger: { bg: '#FBE3E1', text: '#A32119' },
    info: { bg: '#E0E8FB', text: '#1B2F8F' },
  },
  status,
} as const;
