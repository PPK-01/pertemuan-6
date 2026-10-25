import { StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import type { ReactNode } from 'react';

import { formatSessionTime, sessionTimeText } from '@/components/session/sessionTime';
import { StatusBadge } from '@/components/session/StatusBadge';
import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Session } from '@/types';

export type SessionCardProps = {
  session: Session;
  onPress?: () => void;
  /** KHUSUS konten informatif (mis. "Sudah presensi", "3 dari 6 hadir"). JANGAN berisi tombol/elemen yang bisa ditekan. */
  footer?: ReactNode;
  /** Khusus layout (margin, flex, alignSelf), bukan warna/ukuran. */
  style?: StyleProp<ViewStyle>;
};

export function SessionCard({ session, onPress, footer, style }: SessionCardProps) {
  const time = formatSessionTime(session);

  // Tanpa accessibilityLabel agar screen reader membacakan semua teks anak, termasuk footer.
  // Urutan mengikuti scan di kelas: praktikum + status, lalu kelas sebagai pembeda utama.
  return (
    <Card onPress={onPress} style={style}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{session.praktikum}</Text>
          <StatusBadge status={session.status} />
        </View>
        <Text style={styles.kelas}>Kelas {session.kelas}</Text>
        <Text style={styles.time}>{time}</Text>
        <Text style={styles.topik}>{session.topik}</Text>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xs },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  title: { ...typography.heading, color: colors.text, flex: 1 },
  kelas: { ...typography.label, color: colors.textMuted },
  time: { ...sessionTimeText, color: colors.text },
  topik: { ...typography.body, color: colors.text },
  // Garis memisahkan info dari layar (footer) dari data sesi.
  footer: {
    marginTop: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
