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
      {status === 'open' ? (
        <View style={[styles.indicatorCircleFilled, { backgroundColor: text }]} />
      ) : status === 'scheduled' ? (
        <View style={[styles.indicatorCircleHollow, { borderColor: text }]} />
      ) : (
        <View style={[styles.indicatorSquare, { backgroundColor: text }]} />
      )}
      <Text style={[styles.label, { color: text }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    flexShrink: 0,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  label: typography.label,
  indicatorCircleFilled: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  indicatorCircleHollow: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
  },
  indicatorSquare: {
    width: 6,
    height: 6,
    borderRadius: 1,
  },
});
