import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Rekap } from '@/types';
import { formatTime } from '@/utils/time';

export type RekapListProps = {
  rekap: Rekap;
};

// Urutan baris mengikuti store (hadir urut waktu, belum hadir urut nama); tidak diurutkan ulang di sini.
export function RekapList({ rekap }: RekapListProps) {
  const { hadir, belumHadir, total } = rekap;

  return (
    <View style={styles.container}>
      <Text style={styles.summary}>{`${hadir.length} dari ${total} hadir`}</Text>

      <Card>
        <View style={styles.group}>
          <Text style={styles.groupTitle}>{`Sudah hadir (${hadir.length})`}</Text>
          {hadir.length === 0 ? (
            <Text style={styles.empty}>Belum ada praktikan yang presensi.</Text>
          ) : (
            <View>
              {hadir.map(({ user, timestamp }, index) => {
                const time = formatTime(timestamp);
                return (
                  // Pengecualian aturan ARIA: `accessible` menggabungkan nama dan jam jadi satu elemen.
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
      </Card>

      <Card>
        <View style={styles.group}>
          <Text style={styles.groupTitle}>{`Belum hadir (${belumHadir.length})`}</Text>
          {belumHadir.length === 0 ? (
            <Text style={styles.empty}>Semua praktikan sudah hadir.</Text>
          ) : (
            <View>
              {belumHadir.map((user, index) => (
                <View key={user.id} style={[styles.row, index > 0 && styles.rowDivider]}>
                  <Text style={styles.name}>{user.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  summary: { ...typography.title, color: colors.text, fontVariant: ['tabular-nums'] },
  group: { gap: spacing.sm },
  groupTitle: { ...typography.label, color: colors.text },
  empty: { ...typography.body, color: colors.textMuted },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.border },
  // Nama boleh membungkus; jam tidak pernah menyusut agar tidak terpotong.
  name: { ...typography.body, color: colors.text, flex: 1 },
  time: {
    ...typography.label,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    flexShrink: 0,
  },
});
