import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type BannerProps = {
  /** Dipetakan ke colors.feedback. */
  tone: 'success' | 'danger' | 'info';
  message: string;
  title?: string;
  /** Khusus layout (margin, flex, alignSelf), bukan warna/ukuran. */
  style?: StyleProp<ViewStyle>;
};

export function Banner({ tone, message, title, style }: BannerProps) {
  const { bg, text } = colors.feedback[tone];

  return (
    <View
      aria-live="polite"
      style={[
        styles.container,
        { backgroundColor: bg, borderColor: text },
        style,
      ]}
    >
      {title ? <Text style={[styles.title, { color: text }]}>{title}</Text> : null}
      <Text style={[styles.message, { color: text }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: typography.label,
  message: typography.body,
});
