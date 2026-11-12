import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';
import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function KeluarButton() {
  const logout = useAppStore((state) => state.logout);

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  return (
    <Pressable
      accessibilityLabel="Keluar dari akun"
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && { opacity: PRESSED_OPACITY }]}
      onPress={handleLogout}
    >
      <Text style={styles.label}>Keluar</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
