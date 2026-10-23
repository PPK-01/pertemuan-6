import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  /** Default 'primary'. */
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  /** Menampilkan spinner di samping label; tombol tidak bisa ditekan selama loading. */
  loading?: boolean;
  disabled?: boolean;
  /** Teks untuk screen reader bila berbeda dari label. */
  accessibilityLabel?: string;
  /** Khusus layout (margin, flex, alignSelf), bukan warna/ukuran. */
  style?: StyleProp<ViewStyle>;
};

type Variant = NonNullable<ButtonProps['variant']>;

const textColor: Record<Variant, string> = {
  primary: colors.onPrimary,
  secondary: colors.text,
  danger: colors.feedback.danger.text,
  ghost: colors.primary,
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const inactive = disabled || loading;
  const color = disabled ? colors.disabled.text : textColor[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      role="button"
      aria-label={accessibilityLabel}
      aria-disabled={inactive}
      aria-busy={loading}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && variant !== 'ghost' && styles.disabled,
        pressed && !inactive && styles.pressed,
        style,
      ]}
    >
      {loading && <ActivityIndicator size="small" color={color} />}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

// Semua varian ber-border 1 agar tinggi seragam di skala font berapa pun;
// warna border = warna latar varian, kecuali secondary (lihat di bawah).
const styles = StyleSheet.create({
  base: {
    minHeight: layout.minTouch,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  primary: { backgroundColor: colors.primary, borderColor: colors.primary },
  // Pengecualian: border = surface membuat batas tombol hilang di atas Card/BottomSheet.
  secondary: { backgroundColor: colors.surface, borderColor: colors.borderStrong },
  danger: {
    backgroundColor: colors.feedback.danger.bg,
    borderColor: colors.feedback.danger.bg,
  },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  disabled: {
    backgroundColor: colors.disabled.bg,
    borderColor: colors.disabled.bg,
  },
  pressed: { opacity: PRESSED_OPACITY },
  label: { ...typography.label, textAlign: 'center', flexShrink: 1 },
});
