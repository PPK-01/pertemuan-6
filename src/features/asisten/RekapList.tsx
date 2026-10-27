import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Rekap } from '@/types';
import { formatTime } from '@/utils/time';

export type RekapListProps = {
  rekap: Rekap;
};

export function RekapList({ rekap }: RekapListProps) {
  const { hadir, belumHadir, total } = rekap;
  const progressPercent = total > 0 ? Math.round((hadir.length / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <Card>
        <View style={styles.panelContent}>
          <View style={styles.headerRow}>
            <Text
              aria-live="polite"
              style={styles.summary}
            >{`Hadir ${hadir.length} dari ${total}`}</Text>
          </View>

          <View style={styles.track}>
            <View style={[styles.progress, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{`Sudah hadir (${hadir.length})`}</Text>
            {hadir.length === 0 ? (
              <Text style={styles.empty}>Belum ada praktikan yang presensi.</Text>
            ) : (
              <View style={styles.list}>
                {hadir.map(({ user, timestamp }, index) => {
                  const time = formatTime(timestamp);
                  return (
                    <View
                      key={user.id}
                      accessible
                      aria-label={`${user.name}, hadir pukul ${time}`}
                      style={[styles.row, index > 0 && styles.rowDivider]}
                    >
                      <Text style={styles.name}>{user.name}</Text>
                      <Text style={styles.time}>{time}</Text>
                    </View>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.sectionDivider} />

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{`Belum hadir (${belumHadir.length})`}</Text>
            {belumHadir.length === 0 ? (
              <Text style={styles.empty}>Semua praktikan sudah hadir.</Text>
            ) : (
              <View style={styles.list}>
                {belumHadir.map((user, index) => (
                  <View key={user.id} style={[styles.row, index > 0 && styles.rowDivider]}>
                    <Text style={styles.name}>{user.name}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  panelContent: { gap: spacing.md },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  summary: {
    ...typography.title,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  section: { gap: spacing.sm },
  sectionTitle: { ...typography.label, color: colors.text },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  list: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  empty: { ...typography.body, color: colors.textMuted, paddingVertical: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  name: { ...typography.body, color: colors.text, flex: 1 },
  time: {
    ...typography.label,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
});
