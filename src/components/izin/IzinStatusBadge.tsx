import { StyleSheet, Text, View } from 'react-native';
import type { IzinStatus } from '@/types';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type IzinStatusBadgeProps = {
  status: IzinStatus;
};

const STATUS_CONFIG: Record<
  IzinStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  pending_ai: {
    label: 'Analisis AI...',
    bg: '#FFF1C2',
    text: '#5E3B00',
    dot: '#B25900',
  },
  pending_review: {
    label: 'Perlu Diperiksa',
    bg: '#E0E8FB',
    text: '#1B2F8F',
    dot: '#2A4AD0',
  },
  approved: {
    label: 'Disetujui',
    bg: '#DDF1E4',
    text: '#14603A',
    dot: '#14603A',
  },
  rejected: {
    label: 'Ditolak',
    bg: '#FBE3E1',
    text: '#A32119',
    dot: '#A32119',
  },
};

export function IzinStatusBadge({ status }: IzinStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending_ai;

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  text: {
    ...typography.caption,
    fontWeight: '600',
  },
});
