import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { AppBar } from '@/components/ui/AppBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { IdentityCard } from '@/components/ui/IdentityCard';
import { Screen } from '@/components/ui/Screen';
import { RiwayatItem } from '@/features/praktikan/RiwayatItem';
import {
  useAppStore,
  useAttendanceByUser,
  useCurrentUser,
  useSessionsForUser,
} from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Attendance, Session } from '@/types';

type RiwayatEntry = { session: Session; attendance: Attendance };

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function RiwayatScreen() {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id ?? '';
  const resetIdentity = useAppStore((state) => state.resetIdentity);
  const sessions = useSessionsForUser(userId);
  const attendances = useAttendanceByUser(userId);

  const entries = useMemo<RiwayatEntry[]>(() => {
    const attendanceBySession = new Map(
      attendances.map((attendance) => [attendance.sessionId, attendance]),
    );

    return sessions
      .flatMap((session) => {
        const attendance = attendanceBySession.get(session.id);
        return attendance ? [{ session, attendance }] : [];
      })
      .sort((a, b) => b.attendance.timestamp.localeCompare(a.attendance.timestamp));
  }, [sessions, attendances]);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Riwayat" />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Identitas tidak ditemukan"
            message="Kembali ke halaman awal untuk memilih peran dan identitas."
          />
        </Screen>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar subtitle="Riwayat" />

      <Screen scroll={false} edges={['left', 'right']}>
        <View style={styles.screenInner}>
          <FlatList
            data={entries}
            keyExtractor={(item) => item.attendance.id}
            renderItem={({ item }) => (
              <RiwayatItem
                session={item.session}
                attendance={item.attendance}
              />
            )}
            ItemSeparatorComponent={ListSeparator}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.headerBlock}>
                <IdentityCard
                  name={currentUser.name}
                  keyInfo={currentUser.kelas ? `Kelas ${currentUser.kelas}` : 'Praktikan'}
                  supportingInfo="Praktikan"
                  onGantiPeran={resetIdentity}
                />

                {/* Kalimat Ringkasan */}
                <View style={styles.summaryBox}>
                  <Text style={styles.summaryText}>
                    {`${entries.length} sesi tercatat hadir.`}
                  </Text>
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="Belum ada presensi"
                message="Belum ada presensi. Isi kode di sesi yang sedang dibuka."
                action={{
                  label: 'Lihat jadwal',
                  onPress: () => router.push('/praktikan/jadwal'),
                }}
              />
            }
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenInner: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 40,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  summaryBox: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryText: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  separator: {
    height: spacing.sm,
  },
});
