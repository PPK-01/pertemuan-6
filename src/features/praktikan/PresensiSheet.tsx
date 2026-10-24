import { StyleSheet, Text, View } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Session } from '@/types';

export type PresensiSheetProps = {
  visible: boolean;
  session: Session;
  code: string;
  onClose: () => void;
  onConfirm: () => void;
};

export function PresensiSheet({
  visible,
  session,
  code,
  onClose,
  onConfirm,
}: PresensiSheetProps) {
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Konfirmasi presensi"
      secondaryAction={{ label: 'Batal', onPress: onClose }}
      primaryAction={{ label: 'Konfirmasi', onPress: onConfirm }}
    >
      <View style={styles.rows}>
        <InfoRow label="Praktikum" value={session.praktikum} />
        <InfoRow label="Kelas" value={session.kelas} />
        <InfoRow label="Topik" value={session.topik} />
        <InfoRow label="Kode sesi" value={code} isCode />
      </View>
      <Text style={styles.note}>Kehadiran tidak bisa dibatalkan setelah dikonfirmasi.</Text>
    </BottomSheet>
  );
}

function InfoRow({
  label,
  value,
  isCode = false,
}: {
  label: string;
  value: string;
  isCode?: boolean;
}) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, isCode && styles.code]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  rows: { gap: spacing.md },
  row: { gap: spacing.xs },
  label: { ...typography.label, color: colors.textMuted },
  value: { ...typography.body, color: colors.text },
  code: {
    ...typography.heading,
    color: colors.text,
    letterSpacing: 4,
    fontVariant: ['tabular-nums'],
  },
  note: { ...typography.caption, color: colors.textMuted },
});
