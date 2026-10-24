import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';

import { SessionInfo } from '@/components/session/SessionInfo';
import { Banner } from '@/components/ui/Banner';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { ATTEND_FAIL_MESSAGE } from '@/features/praktikan/attendMessages';
import { PresensiForm } from '@/features/praktikan/PresensiForm';
import { PresensiSheet } from '@/features/praktikan/PresensiSheet';
import { useAppStore, useAttendanceByUser, useSessionById } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDateTime } from '@/utils/time';

type SheetStep = 'confirm' | 'success' | null;

export default function DetailSesiScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const currentUserId = useAppStore((state) => state.currentUserId);
  const currentUser = useAppStore(
    (state) => state.users.find((user) => user.id === currentUserId) ?? null,
  );
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
      <Screen>
        <EmptyState
          title="Identitas tidak ditemukan"
          message="Kembali ke halaman awal untuk memilih peran dan identitas."
          action={{ label: 'Ke halaman awal', onPress: () => router.replace('/') }}
        />
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen>
        <EmptyState
          title="Sesi tidak ditemukan"
          message="Sesi ini mungkin sudah tidak tersedia."
          action={{
            label: 'Kembali ke jadwal',
            onPress: () => router.replace('/praktikan/jadwal'),
          }}
        />
      </Screen>
    );
  }

  if (session.kelas !== currentUser.kelas) {
    return (
      <Screen>
        <EmptyState
          title="Sesi tidak tersedia"
          message="Sesi ini bukan untuk kelasmu."
          action={{
            label: 'Kembali ke jadwal',
            onPress: () => router.replace('/praktikan/jadwal'),
          }}
        />
      </Screen>
    );
  }

  const activeUserId = currentUser.id;

  function handleChangeCode(nextCode: string) {
    setCode(nextCode);
    setCodeError(undefined);
    setBannerMessage(undefined);
  }

  function handleOpenConfirm() {
    Keyboard.dismiss();
    setCodeError(undefined);
    setBannerMessage(undefined);
    setSheet('confirm');
  }

  function handleConfirm() {
    const result = submitAttendance(sessionId, activeUserId, code);
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
    <Screen>
      <View style={styles.page}>
        <Card>
          <SessionInfo session={session} />
        </Card>

        {attendance ? (
          <View style={styles.attendanceBlock}>
            <Banner
              tone="success"
              title="Presensi tercatat"
              message={`Kamu sudah presensi pada sesi ini. Kehadiran tercatat pada ${formatDateTime(
                attendance.timestamp,
              )}.`}
            />
            <Button label="Sudah presensi" onPress={() => undefined} disabled />
          </View>
        ) : session.status === 'open' ? (
          <PresensiForm
            code={code}
            onChangeCode={handleChangeCode}
            onSubmit={handleOpenConfirm}
            error={codeError}
            banner={
              bannerMessage ? <Banner tone="danger" message={bannerMessage} /> : undefined
            }
          />
        ) : session.status === 'closed' ? (
          <Banner
            tone="info"
            title="Sesi sudah ditutup"
            message="Kamu tidak tercatat hadir pada sesi ini."
          />
        ) : (
          <Banner
            tone="info"
            title="Sesi belum dibuka"
            message="Presensi bisa dilakukan setelah asisten membuka sesi."
          />
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
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.lg },
  attendanceBlock: { gap: spacing.md },
  success: { gap: spacing.md },
  successRow: { gap: spacing.xs },
  successLabel: { ...typography.label, color: colors.textMuted },
  successValue: {
    ...typography.body,
    fontWeight: typography.label.fontWeight,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
});
