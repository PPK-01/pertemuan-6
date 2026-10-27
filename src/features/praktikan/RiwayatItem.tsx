import { StyleSheet, Text, View } from 'react-native';

import { formatSessionTime } from '@/components/session/sessionTime';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Attendance, Session } from '@/types';
import { formatDateTime } from '@/utils/time';

export type RiwayatItemProps = {
  session: Session;
  attendance: Attendance;
};

export function RiwayatItem({ session, attendance }: RiwayatItemProps) {
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headingGroup}>
            <Text style={styles.title}>{session.praktikum}</Text>
            <Text style={styles.meta}>Kelas {session.kelas}</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillLabel}>Hadir</Text>
          </View>
        </View>

        <Text style={styles.topic}>{session.topik}</Text>

        <View style={styles.divider} />

        <View style={styles.details}>
          <DetailRow label="Sesi" value={formatSessionTime(session)} />
          <DetailRow
            label="Waktu hadir"
            value={formatDateTime(attendance.timestamp)}
            emphasized
          />
        </View>
      </View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  emphasized = false,
}: {
  label: string;
  value: string;
  emphasized?: boolean;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, emphasized && styles.detailValueEmphasized]}>{value}</Text>
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
  content: { gap: spacing.sm },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  headingGroup: { flex: 1, gap: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  meta: { ...typography.label, color: colors.textMuted },
  pill: {
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.feedback.success.bg,
  },
  pillLabel: {
    ...typography.caption,
    fontWeight: typography.label.fontWeight,
    color: colors.feedback.success.text,
  },
  topic: { ...typography.body, color: colors.text },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.xs },
  details: { gap: spacing.sm },
  detailRow: { gap: spacing.xs },
  detailLabel: { ...typography.caption, color: colors.textMuted },
  detailValue: { ...typography.body, color: colors.text },
  detailValueEmphasized: {
    fontWeight: typography.label.fontWeight,
    fontVariant: ['tabular-nums'],
  },
});
