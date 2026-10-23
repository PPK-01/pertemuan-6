import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { STATUS_LABEL } from '@/components/session/statusLabel';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { SessionStatus } from '@/types';

export type StatusBadgeProps = {
  status: SessionStatus;
  /** Khusus layout (margin, flex, alignSelf), bukan warna/ukuran. */
  style?: StyleProp<ViewStyle>;
};

export function StatusBadge({ status, style }: StatusBadgeProps) {
  const { bg, text } = colors.status[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.label, { color: text }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    // Di samping judul panjang, judul yang membungkus; badge tidak boleh gepeng.
    flexShrink: 0,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: typography.label,
});
