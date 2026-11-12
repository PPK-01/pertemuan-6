import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { SessionRow } from '@/components/session/SessionRow';
import { AppBar } from '@/components/ui/AppBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { IdentityCard } from '@/components/ui/IdentityCard';
import { Screen } from '@/components/ui/Screen';
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

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function JadwalScreen() {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id ?? '';
  const logout = useAppStore((state) => state.logout);
  const sessions = useSessionsForUser(userId);
  const attendances = useAttendanceByUser(userId);
  const izinList = useIzinByUser(userId);

  const attendedSessionIds = useMemo(
    () => new Set(attendances.map((a) => a.sessionId)),
    [attendances],
  );

  const approvedIzinSessionIds = useMemo(
    () => new Set(izinList.filter((i) => i.status === 'approved').map((i) => i.sessionId)),
    [izinList],
  );

  const activeOpenSessions = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.status === 'open' &&
          !attendedSessionIds.has(s.id) &&
          !approvedIzinSessionIds.has(s.id),
      ),
    [sessions, attendedSessionIds, approvedIzinSessionIds],
  );

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Jadwal" />
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
      <AppBar subtitle="Jadwal Praktikum" />

      <Screen scroll={false} edges={['left', 'right']}>
        <View style={styles.screenInner}>
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const attended = attendedSessionIds.has(item.id);
              const izinApproved = approvedIzinSessionIds.has(item.id);
              const isOpen = item.status === 'open' && !attended && !izinApproved;

              let footerText: string | undefined;
              if (attended) {
                footerText = 'Sudah presensi';
              } else if (izinApproved) {
                footerText = 'Izin disetujui';
              } else if (isOpen) {
                footerText = 'Sedang dibuka • Tekan untuk presensi';
              }

              return (
                <SessionRow
                  session={item}
                  onPress={() =>
                    router.push({
                      pathname: '/praktikan/sesi/[id]',
                      params: { id: item.id },
                    })
                  }
                  footerText={footerText}
                />
              );
            }}
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

                {/* Strip Sedang Dibuka */}
                {activeOpenSessions.length > 0 ? (
                  <View style={styles.openStrip}>
                    <View style={styles.openStripDot} />
                    <Text style={styles.openStripText}>
                      Ada {activeOpenSessions.length} sesi yang sedang dibuka untuk presensi.
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.sectionTitle}>Semua Sesi Praktikum</Text>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="Belum ada sesi"
                message={`Belum ada sesi praktikum yang dijadwalkan untuk Kelas ${currentUser.kelas ?? ''}.`}
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
  sectionTitle: {
    ...typography.label,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  openStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#DDF1E4',
    borderColor: '#14603A',
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  openStripDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: '#14603A',
  },
  openStripText: {
    ...typography.caption,
    color: '#14603A',
    fontWeight: '600',
    flex: 1,
  },
});
