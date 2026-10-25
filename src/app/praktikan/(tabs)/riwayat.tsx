import { router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EmptyState } from '@/components/ui/EmptyState';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { RiwayatItem } from '@/features/praktikan/RiwayatItem';
import { useAttendanceByUser, useCurrentUser, useSessionsForUser } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Attendance, Session } from '@/types';

/** Tinggi bar progress ringkasan kehadiran. */
const SUMMARY_TRACK_HEIGHT = 8;

type RiwayatEntry = { session: Session; attendance: Attendance };

export default function RiwayatScreen() {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id ?? '';
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
      .sort(
        (a, b) =>
          new Date(b.attendance.timestamp).getTime() -
          new Date(a.attendance.timestamp).getTime(),
      );
  }, [sessions, attendances]);

  const countedSessions = useMemo(
    () => sessions.filter((session) => session.status !== 'scheduled'),
    [sessions],
  );

  const percent =
    countedSessions.length > 0 ? Math.round((entries.length / countedSessions.length) * 100) : 0;

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
          <Text style={styles.title}>Riwayat kehadiran</Text>
          <Text style={styles.meta}>
            {entries.length} dari {countedSessions.length} sesi
            {currentUser.kelas ? ` untuk Kelas ${currentUser.kelas}` : ''}
          </Text>
        </View>

        {countedSessions.length > 0 ? (
          <Card>
            <View style={styles.summary}>
              <View style={styles.summaryHeader}>
                <Text style={styles.summaryTitle}>Kehadiran</Text>
                <Text style={styles.summaryValue}>{percent}%</Text>
              </View>
              <View
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={countedSessions.length}
                aria-valuenow={entries.length}
                style={styles.track}
              >
                <View style={[styles.trackFill, { width: `${percent}%` }]} />
              </View>
              <Text style={styles.summaryMeta}>
                {entries.length} sesi dihadiri, {countedSessions.length - entries.length} sesi belum
                dihadiri
              </Text>
            </View>
          </Card>
        ) : null}

        {entries.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat"
            message="Kehadiran yang sudah dicatat akan muncul di sini."
            action={
              countedSessions.length > 0
                ? { label: 'Lihat jadwal', onPress: () => router.navigate('/praktikan/jadwal') }
                : undefined
            }
          />
        ) : (
          <View style={styles.list}>
            {entries.map(({ session, attendance }) => (
              <RiwayatItem key={attendance.id} session={session} attendance={attendance} />
            ))}
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  intro: { gap: spacing.xs },
  title: { ...typography.title, color: colors.text },
  meta: { ...typography.label, color: colors.textMuted },
  summary: { gap: spacing.sm },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  summaryTitle: { ...typography.heading, color: colors.text },
  summaryValue: { ...typography.title, color: colors.text, fontVariant: ['tabular-nums'] },
  track: {
    height: SUMMARY_TRACK_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.feedback.success.text,
  },
  summaryMeta: { ...typography.caption, color: colors.textMuted },
  list: { gap: spacing.md },
});
