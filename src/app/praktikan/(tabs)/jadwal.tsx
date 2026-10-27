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
  useSessionsForUser,
} from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Session } from '@/types';

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function JadwalScreen() {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id ?? '';
  const resetIdentity = useAppStore((state) => state.resetIdentity);
  const sessions = useSessionsForUser(userId);
  const attendances = useAttendanceByUser(userId);

  const attendedSessionIds = useMemo(
    () => new Set(attendances.map((a) => a.sessionId)),
    [attendances],
  );

  const activeOpenSessions = useMemo(
    () => sessions.filter((s) => s.status === 'open' && !attendedSessionIds.has(s.id)),
    [sessions, attendedSessionIds],
  );

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Jadwal" />
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
      <AppBar subtitle="Jadwal" />

      <Screen scroll={false} edges={['left', 'right']}>
        <View style={styles.screenInner}>
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const attended = attendedSessionIds.has(item.id);
              const isOpen = item.status === 'open' && !attended;

              return (
                <SessionRow
                  session={item}
                  onPress={() =>
                    router.push({
                      pathname: '/praktikan/sesi/[id]',
                      params: { id: item.id },
                    })
                  }
                  footerText={
                    attended
                      ? 'Sudah presensi'
                      : isOpen
                      ? 'Sedang dibuka • Tekan untuk presensi'
                      : undefined
                  }
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
                  supportingInfo="Praktikan"
                  onGantiPeran={resetIdentity}
                />

                {/* Strip Sedang Dibuka */}
                {activeOpenSessions.length > 0 ? (
                  <View style={styles.openStrip}>
                    <View style={styles.activeDot} />
                    <Text style={styles.openStripText}>
                      {activeOpenSessions.length === 1
                        ? '1 sesi sedang dibuka untuk kelasmu'
                        : `${activeOpenSessions.length} sesi sedang dibuka untuk kelasmu`}
                    </Text>
                  </View>
                ) : null}
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="Belum ada jadwal"
                message="Jadwal praktikum akan tampil di sini."
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
  openStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.status.open.bg,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'rgba(20, 96, 58, 0.25)',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.status.open.text,
  },
  openStripText: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    fontWeight: typography.label.fontWeight,
    color: colors.status.open.text,
  },
  separator: {
    height: spacing.sm,
  },
});
