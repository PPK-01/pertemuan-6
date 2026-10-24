import { Pressable, StyleSheet, Text } from 'react-native';

import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function GantiPeranButton() {
  const resetIdentity = useAppStore((state) => state.resetIdentity);

  function handlePress() {
    resetIdentity();
  }

  return (
    <Pressable
      onPress={handlePress}
      role="button"
      accessibilityLabel="Ganti peran"
      hitSlop={spacing.sm}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <Text style={styles.label}>Ganti peran</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.minTouch,
    minWidth: layout.minTouch,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  pressed: { opacity: PRESSED_OPACITY },
  label: { ...typography.label, color: colors.primary },
});
