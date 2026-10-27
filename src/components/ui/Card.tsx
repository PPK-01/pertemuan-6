import { Pressable, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';

export type CardProps = {
  children: ReactNode;
  /** Ada = Card bisa ditekan (role button). */
  onPress?: () => void;
  /** Teks untuk screen reader; isi Card dibacakan sebagai satu kesatuan. */
  accessibilityLabel?: string;
  /** Khusus layout (margin, flex, alignSelf), bukan warna/ukuran. */
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, onPress, accessibilityLabel, style }: CardProps) {
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        role="button"
        aria-label={accessibilityLabel}
        style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View
      accessible={accessibilityLabel !== undefined}
      aria-label={accessibilityLabel}
      style={[styles.card, style]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  pressed: { opacity: PRESSED_OPACITY },
});
