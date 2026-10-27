import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { colors } from '@/theme/colors';
import { layout, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type AppBarProps = {
  title?: string;
  subtitle?: string;
  canGoBack?: boolean;
  onGoBack?: () => void;
  rightAction?: ReactNode;
};

function BackIcon() {
  return (
    <View style={styles.backIconFrame}>
      <View style={styles.chevronTop} />
      <View style={styles.chevronBottom} />
    </View>
  );
}

export function AppBar({
  title = 'Presensi Praktikum',
  subtitle,
  canGoBack = false,
  onGoBack,
  rightAction,
}: AppBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.wrapper, { paddingTop: insets.top }]}>
      <View style={styles.bar}>
        <View style={styles.sideSlot}>
          {canGoBack && onGoBack ? (
            <Pressable
              onPress={onGoBack}
              role="button"
              aria-label="Kembali ke layar sebelumnya"
              style={({ pressed }) => [styles.backButton, pressed && { opacity: PRESSED_OPACITY }]}
            >
              <BackIcon />
            </Pressable>
          ) : null}
        </View>

        <View style={styles.centerSlot}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={[styles.sideSlot, styles.rightSlot]}>
          {rightAction ?? null}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  bar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  sideSlot: {
    width: 48,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightSlot: {
    alignItems: 'flex-end',
  },
  centerSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  subtitle: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.caption.fontWeight,
    color: colors.onPrimary,
    opacity: 0.85,
    marginTop: 2,
  },
  backButton: {
    minWidth: layout.minTouch,
    minHeight: layout.minTouch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIconFrame: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  chevronTop: {
    width: 10,
    height: 2.5,
    backgroundColor: colors.onPrimary,
    borderRadius: 1,
    transform: [{ rotate: '-45deg' }, { translateY: -3 }],
  },
  chevronBottom: {
    width: 10,
    height: 2.5,
    backgroundColor: colors.onPrimary,
    borderRadius: 1,
    transform: [{ rotate: '45deg' }, { translateY: 3 }],
  },
});
