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
  useIzinByUser,
  useSessionsForUser,
} from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Attendance, Session } from '@/types';

type RiwayatEntry = { session: Session; attendance: Attendance };

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function RiwayatScreen() {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id ?? '';
  const logout = useAppStore((state) => state.logout);
  const sessions = useSessionsForUser(userId);
  const attendances = useAttendanceByUser(userId);
  const izinList = useIzinByUser(userId);

  const approvedIzinCount = useMemo(
    () => izinList.filter((i) => i.status === 'approved').length,
    [izinList],
  );

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

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Riwayat" />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Identitas tidak ditemukan"
            message="Silakan masuk kembali ke akun praktikan."
            action={{ label: 'Masuk', onPress: () => router.replace('/(auth)/login') }}
          />
        </Screen>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AppBar subtitle="Riwayat Kehadiran" />

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
                  supportingInfo="Laboratorium Komputer"
                  actionLabel="Keluar"
                  onAction={handleLogout}
                />

                {/* Ringkasan Kehadiran & Izin (FR-11) */}
                <View style={styles.summaryContainer}>
                  <View style={styles.summaryBox}>
                    <Text style={styles.summaryNumber}>{entries.length}</Text>
                    <Text style={styles.summaryLabel}>Tercatat Hadir</Text>
                  </View>

                  <View style={[styles.summaryBox, styles.summaryBoxIzin]}>
                    <Text style={[styles.summaryNumber, styles.summaryNumberIzin]}>
                      {approvedIzinCount}
                    </Text>
                    <Text style={styles.summaryLabel}>Izin Disetujui</Text>
                  </View>
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="Belum ada presensi"
                message="Kamu belum memiliki rekaman kehadiran. Masukkan kode 4 digit pada sesi praktikum yang sedang dibuka."
                action={{
                  label: 'Lihat Jadwal',
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
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.sm,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  summaryBoxIzin: {
    backgroundColor: '#F7F8FC',
  },
  summaryNumber: {
    ...typography.display,
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  summaryNumberIzin: {
    color: '#1B2F8F',
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
  separator: {
    height: spacing.sm,
  },
});
