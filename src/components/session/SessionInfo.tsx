import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { formatSessionTime, sessionTimeText } from '@/components/session/sessionTime';
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
  const valueText = (text: string, textStyle: TextStyle = styles.valueText) => (
    <Text style={textStyle}>{text}</Text>
  );

  const rows: { label: string; value: ReactNode }[] = [
    { label: 'Praktikum', value: valueText(session.praktikum) },
    { label: 'Kelas', value: valueText(session.kelas) },
    { label: 'Topik', value: valueText(session.topik) },
    { label: 'Ruang', value: valueText(session.ruang) },
    { label: 'Waktu', value: valueText(formatSessionTime(session), styles.timeText) },
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
  row: { flexDirection: 'row', gap: spacing.sm },
  // lineHeight disamakan dengan body agar baris pertama label sejajar dengan nilainya.
  label: {
    ...typography.label,
    lineHeight: typography.body.lineHeight,
    color: colors.textMuted,
    flex: 1,
  },
  value: { flex: 2 },
  valueText: { ...typography.body, color: colors.text },
  timeText: { ...sessionTimeText, color: colors.text },
});
