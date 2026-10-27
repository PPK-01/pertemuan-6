import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { SessionInfo } from '@/components/session/SessionInfo';
import { AppBar } from '@/components/ui/AppBar';
import { Banner } from '@/components/ui/Banner';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { ATTEND_FAIL_MESSAGE } from '@/features/praktikan/attendMessages';
import { PresensiForm } from '@/features/praktikan/PresensiForm';
import { PresensiSheet } from '@/features/praktikan/PresensiSheet';
import { useAppStore, useAttendanceByUser, useCurrentUser, useSessionById } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDateTime, formatTime } from '@/utils/time';

type SheetStep = 'confirm' | 'success' | null;

export default function DetailSesiScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const currentUser = useCurrentUser();
  const submitAttendance = useAppStore((state) => state.submitAttendance);

  const session = useSessionById(sessionId);
  const attendances = useAttendanceByUser(currentUser?.id ?? '');
  const attendance = attendances.find((item) => item.sessionId === sessionId);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();
  const [bannerMessage, setBannerMessage] = useState<string | undefined>();
  const [sheet, setSheet] = useState<SheetStep>(null);
  const [successAt, setSuccessAt] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Detail sesi" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Identitas tidak ditemukan"
            message="Kembali ke halaman awal untuk memilih peran dan identitas."
          />
        </Screen>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Detail sesi" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Sesi tidak ditemukan"
            message="Sesi yang kamu cari tidak terdaftar."
            action={{ label: 'Lihat jadwal', onPress: () => router.back() }}
          />
        </Screen>
      </View>
    );
  }

  const isClassMismatch = currentUser.kelas !== session.kelas;
  if (isClassMismatch) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Detail sesi" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <View style={styles.page}>
            <Card>
              <SessionInfo session={session} />
            </Card>
            <Banner tone="danger" message={ATTEND_FAIL_MESSAGE.NOT_IN_CLASS} />
          </View>
        </Screen>
      </View>
    );
  }

  function handleChangeCode(nextCode: string) {
    setCode(nextCode);
    if (codeError) setCodeError(undefined);
    if (bannerMessage) setBannerMessage(undefined);
  }

  function handleOpenConfirm() {
    if (code.length !== 4) return;
    Keyboard.dismiss();
    setSheet('confirm');
  }

  function handleConfirm() {
    if (!currentUser || !session) return;
    const result = submitAttendance(session.id, currentUser.id, code);

    if (result.ok) {
      setSuccessAt(result.attendance.timestamp);
      setCode('');
      setCodeError(undefined);
      setBannerMessage(undefined);
      setSheet('success');
      return;
    }

    const message = ATTEND_FAIL_MESSAGE[result.reason];
    setSheet(null);
    if (result.reason === 'INVALID_CODE') {
      setCodeError(message);
    } else {
      setBannerMessage(message);
    }
  }

  function handleCloseSuccess() {
    setSheet(null);
    setSuccessAt(null);
  }

  return (
    <View style={styles.container}>
      <AppBar subtitle="Detail sesi" canGoBack onGoBack={() => router.back()} />

      <Screen edges={['left', 'right', 'bottom']}>
        <View style={styles.page}>
          <Card>
            <SessionInfo session={session} />
          </Card>

          {!attendance && bannerMessage ? (
            <Banner tone="danger" message={bannerMessage} />
          ) : null}

          {attendance ? (
            <View style={styles.attendanceBlock}>
              <Banner
                tone="success"
                title="Presensi tercatat"
                message={`Kamu sudah presensi pada sesi ini. Kehadiran tercatat pada ${formatDateTime(
                  attendance.timestamp,
                )}.`}
              />
              <Button
                label={`Sudah presensi pukul ${formatTime(attendance.timestamp)}`}
                onPress={() => undefined}
                disabled
              />
            </View>
          ) : session.status === 'open' ? (
            <PresensiForm
              code={code}
              onChangeCode={handleChangeCode}
              onSubmit={handleOpenConfirm}
              error={codeError}
            />
          ) : session.status === 'closed' ? (
            <View style={styles.attendanceBlock}>
              <Banner
                tone="info"
                title="Sesi sudah ditutup"
                message={ATTEND_FAIL_MESSAGE.SESSION_NOT_OPEN}
              />
              <Button label="Sesi ditutup" onPress={() => undefined} disabled />
            </View>
          ) : (
            <View style={styles.attendanceBlock}>
              <Banner
                tone="info"
                title="Sesi belum dibuka"
                message={ATTEND_FAIL_MESSAGE.SESSION_NOT_OPEN}
              />
              <Button label="Sesi belum dibuka" onPress={() => undefined} disabled />
            </View>
          )}
        </View>

        <PresensiSheet
          visible={sheet === 'confirm'}
          session={session}
          code={code}
          onClose={() => setSheet(null)}
          onConfirm={handleConfirm}
        />

        <BottomSheet
          visible={sheet === 'success'}
          onClose={handleCloseSuccess}
          title="Presensi berhasil"
          primaryAction={{ label: 'Selesai', onPress: handleCloseSuccess }}
        >
          <View style={styles.success}>
            <Banner tone="success" message="Kehadiranmu sudah tercatat pada sesi ini." />
            <View style={styles.successRow}>
              <Text style={styles.successLabel}>Waktu presensi</Text>
              <Text style={styles.successValue}>
                {successAt ? formatDateTime(successAt) : '-'}
              </Text>
            </View>
          </View>
        </BottomSheet>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  page: {
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  attendanceBlock: {
    gap: spacing.md,
  },
  success: {
    gap: spacing.md,
  },
  successRow: {
    gap: spacing.xs,
  },
  successLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  successValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
});
