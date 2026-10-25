import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { EmptyState } from '@/components/ui/EmptyState';
import { SessionCard } from '@/components/session/SessionCard';
import { useAttendanceByUser, useCurrentUser, useSessionsForUser } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Session } from '@/types';

export default function JadwalScreen() {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id ?? '';
  const sessions = useSessionsForUser(userId);
  const attendances = useAttendanceByUser(userId);

  const attendedSessionIds = useMemo(
    () => new Set(attendances.map((attendance) => attendance.sessionId)),
    [attendances],
  );

  if (!currentUser) {
    return (
      <Screen edges={['left', 'right']}>
        <EmptyState
          title="Identitas tidak ditemukan"
          message="Kembali ke halaman awal untuk memilih peran dan identitas."
        />
      </Screen>
    );
  }

  return (
    <Screen edges={['left', 'right']}>
      <View style={styles.page}>
        <View style={styles.intro}>
          <Text style={styles.greeting}>Halo, {currentUser.name}</Text>
          <Text style={styles.meta}>
            {currentUser.kelas ? `Kelas ${currentUser.kelas}` : 'Praktikan'},{' '}
            {sessions.length} sesi
          </Text>
        </View>

        {sessions.length === 0 ? (
          <EmptyState
            title="Belum ada jadwal"
            message="Sesi untuk kelasmu akan muncul di sini setelah asisten membuatnya."
          />
        ) : (
          <View style={styles.list}>
            {sessions.map((session) => {
              const attended = attendedSessionIds.has(session.id);
              return (
                <SessionCard
                  key={session.id}
                  session={session}
                  onPress={() =>
                    router.push({
                      pathname: '/praktikan/sesi/[id]',
                      params: { id: session.id },
                    })
                  }
                  footer={<SessionFooter session={session} attended={attended} />}
                />
              );
            })}
          </View>
        )}
      </View>
    </Screen>
  );
}

function SessionFooter({ session, attended }: { session: Session; attended: boolean }) {
  if (session.status === 'open') {
    return (
      <Text style={[styles.footerText, attended ? styles.successText : styles.primaryText]}>
        {attended ? 'Sudah presensi' : 'Presensi sedang dibuka'}
      </Text>
    );
  }

  if (session.status === 'closed') {
    return (
      <Text style={[styles.footerText, attended ? styles.successText : styles.mutedText]}>
        {attended ? 'Hadir' : 'Tidak hadir'}
      </Text>
    );
  }

  return <Text style={[styles.footerText, styles.mutedText]}>Belum dibuka</Text>;
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  intro: { gap: spacing.xs },
  greeting: { ...typography.title, color: colors.text },
  meta: { ...typography.label, color: colors.textMuted },
  list: { gap: spacing.md },
  footerText: { ...typography.label },
  primaryText: { color: colors.primary },
  successText: { color: colors.feedback.success.text },
  mutedText: { color: colors.textMuted },
});
