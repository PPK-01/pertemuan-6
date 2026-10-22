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
  return (
    <View style={[styles.container, style]}>
      <InfoRow label="Praktikum">{session.praktikum}</InfoRow>
      <InfoRow label="Kelas">{session.kelas}</InfoRow>
      <InfoRow label="Topik">{session.topik}</InfoRow>
      <InfoRow label="Ruang">{session.ruang}</InfoRow>
      <InfoRow label="Waktu">{formatSessionTime(session)}</InfoRow>
      <InfoRow label="Status">
        <StatusBadge status={session.status} />
      </InfoRow>
    </View>
  );
}

function InfoRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.value}>
        {typeof children === 'string' ? <Text style={styles.valueText}>{children}</Text> : children}
      </View>
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
