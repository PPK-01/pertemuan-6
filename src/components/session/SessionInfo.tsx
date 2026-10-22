import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { formatSessionTime } from '@/components/session/sessionTime';
import { StatusBadge } from '@/components/session/StatusBadge';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Session } from '@/types';

export type SessionInfoProps = {
  session: Session;
  /** Khusus layout (margin, flex, alignSelf), bukan warna/ukuran. */
  style?: StyleProp<ViewStyle>;
};

export function SessionInfo({ session, style }: SessionInfoProps) {
  const valueText = (text: string) => <Text style={styles.valueText}>{text}</Text>;

  const rows: { label: string; value: ReactNode }[] = [
    { label: 'Praktikum', value: valueText(session.praktikum) },
    { label: 'Kelas', value: valueText(session.kelas) },
    { label: 'Topik', value: valueText(session.topik) },
    { label: 'Ruang', value: valueText(session.ruang) },
    { label: 'Waktu', value: valueText(formatSessionTime(session)) },
    { label: 'Status', value: <StatusBadge status={session.status} /> },
  ];

  return (
    <View style={[styles.container, style]}>
      {rows.map(({ label, value }) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <View style={styles.value}>{value}</View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  label: { ...typography.label, color: colors.textMuted, flex: 1 },
  value: { flex: 2 },
  valueText: { ...typography.body, color: colors.text },
});
