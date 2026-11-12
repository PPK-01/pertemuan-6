import { Pressable, StyleSheet, Text, View } from 'react-native';
import { IzinStatusBadge } from './IzinStatusBadge';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDateTime } from '@/utils/time';
import type { Izin } from '@/types';

export type IzinRowProps = {
  izin: Izin;
  praktikum?: string;
  topik?: string;
  onPress?: () => void;
};

export function IzinRow({ izin, praktikum, topik, onPress }: IzinRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.praktikumText} numberOfLines={1}>
            {praktikum || 'Praktikum'}
          </Text>
          {topik ? (
            <Text style={styles.topikText} numberOfLines={1}>
              {topik}
            </Text>
          ) : null}
        </View>
        <IzinStatusBadge status={izin.status} />
      </View>

      <Text style={styles.alasanPreview} numberOfLines={2}>
        &ldquo;{izin.alasan}&rdquo;
      </Text>

      <View style={styles.footer}>
        <Text style={styles.timeText}>Diajukan: {formatDateTime(izin.createdAt)}</Text>
        {izin.review?.catatan ? (
          <Text style={styles.noteIndicator}>Ada catatan asisten</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardPressed: {
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  titleContainer: {
    flex: 1,
  },
  praktikumText: {
    ...typography.label,
    color: colors.text,
    fontWeight: '700',
  },
  topikText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  alasanPreview: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  timeText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  noteIndicator: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
