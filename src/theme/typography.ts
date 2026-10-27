import type { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '700' },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '400' },
  code: {
    fontSize: 48,
    lineHeight: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
} as const satisfies Record<string, TextStyle>;
