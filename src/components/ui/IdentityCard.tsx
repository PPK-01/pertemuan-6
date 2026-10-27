import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type IdentityCardProps = {
  name: string;
  keyInfo: string;
  supportingInfo: string;
  onGantiPeran: () => void;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return '?';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

export function IdentityCard({
  name,
  keyInfo,
  supportingInfo,
  onGantiPeran,
}: IdentityCardProps) {
  const initials = getInitials(name);

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <Pressable
          onPress={onGantiPeran}
          role="button"
          aria-label="Ganti peran"
          style={({ pressed }) => [
            styles.gantiButton,
            pressed && { opacity: PRESSED_OPACITY },
          ]}
        >
          <Text style={styles.gantiButtonText}>Ganti peran</Text>
        </Pressable>
      </View>

      <View style={styles.infoBlock}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.keyInfo}>{keyInfo}</Text>
        <Text style={styles.supportingInfo}>{supportingInfo}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary,
    borderRadius: radius.identity,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  gantiButton: {
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gantiButtonText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.onPrimary,
  },
  infoBlock: {
    gap: 3,
  },
  name: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '700',
    color: colors.onPrimary,
  },
  keyInfo: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.accent,
  },
  supportingInfo: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.onPrimary,
    opacity: 0.85,
  },
});
