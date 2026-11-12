import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type IdentityCardProps = {
  name: string;
  keyInfo: string;
  supportingInfo: string;
  actionLabel?: string;
  onAction?: () => void;
  onGantiPeran?: () => void;
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
  actionLabel = 'Keluar',
  onAction,
  onGantiPeran,
}: IdentityCardProps) {
  const initials = getInitials(name);
  const handlePress = onAction || onGantiPeran;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {handlePress ? (
          <Pressable
            onPress={handlePress}
            role="button"
            aria-label={actionLabel}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: PRESSED_OPACITY },
            ]}
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
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
    gap: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.title,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  actionButton: {
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    ...typography.label,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  infoBlock: {
    gap: 2,
  },
  name: {
    ...typography.title,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  keyInfo: {
    ...typography.label,
    color: colors.accent,
    fontWeight: '600',
  },
  supportingInfo: {
    ...typography.caption,
    color: colors.onPrimary,
    opacity: 0.8,
  },
});
