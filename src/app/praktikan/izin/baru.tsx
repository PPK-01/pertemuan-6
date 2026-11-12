import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SessionInfo } from '@/components/session/SessionInfo';
import { AppBar } from '@/components/ui/AppBar';
import { Banner } from '@/components/ui/Banner';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { IzinForm } from '@/features/praktikan/IzinForm';
import {
  useAppStore,
  useCurrentUser,
  useHasAttended,
  useIzinByUser,
  useSessionById,
} from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function PengajuanIzinBaruScreen() {
  const params = useLocalSearchParams<{ sessionId?: string | string[] }>();
  const sessionId = Array.isArray(params.sessionId)
    ? params.sessionId[0] ?? ''
    : params.sessionId ?? '';

  const currentUser = useCurrentUser();
  const session = useSessionById(sessionId);
  const alreadyAttended = useHasAttended(sessionId, currentUser?.id ?? '');
  const izinList = useIzinByUser(currentUser?.id ?? '');
  const existingIzin = izinList.find((i) => i.sessionId === sessionId);

  const submitIzin = useAppStore((state) => state.submitIzin);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  if (!currentUser) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Ajukan Izin" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Identitas tidak ditemukan"
            message="Silakan masuk kembali untuk mengajukan izin."
            action={{ label: 'Masuk', onPress: () => router.replace('/(auth)/login') }}
          />
        </Screen>
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Ajukan Izin" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Sesi tidak ditemukan"
            message="Sesi praktikum yang dipilih tidak terdaftar."
            action={{ label: 'Kembali ke Jadwal', onPress: () => router.replace('/praktikan/jadwal') }}
          />
        </Screen>
      </View>
    );
  }

  if (alreadyAttended) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Ajukan Izin" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Sudah Presensi"
            message="Kamu sudah tercatat hadir pada sesi ini. Izin tidak dapat diajukan."
            action={{ label: 'Lihat Sesi', onPress: () => router.back() }}
          />
        </Screen>
      </View>
    );
  }

  if (existingIzin) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Ajukan Izin" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Izin Sudah Diajukan"
            message="Kamu sudah mengajukan izin untuk sesi ini sebelumnya. Silakan periksa statusnya."
            action={{
              label: 'Lihat Detail Izin',
              onPress: () =>
                router.replace({
                  pathname: '/praktikan/izin/[id]',
                  params: { id: existingIzin.id },
                }),
            }}
          />
        </Screen>
      </View>
    );
  }

  async function handleSubmit(sanitizedAlasan: string) {
    setErrorMessage(undefined);
    setSubmitting(true);

    const result = await submitIzin(sessionId, sanitizedAlasan);
    setSubmitting(false);

    if (result.ok) {
      router.replace({
        pathname: '/praktikan/izin/[id]',
        params: { id: result.data.id },
      });
    } else {
      setErrorMessage(result.message);
    }
  }

  return (
    <View style={styles.container}>
      <AppBar subtitle="Ajukan Izin" canGoBack onGoBack={() => router.back()} />

      <Screen edges={['left', 'right', 'bottom']}>
        <View style={styles.pageContent}>
          {errorMessage ? <Banner tone="danger" message={errorMessage} /> : null}

          <Card>
            <SessionInfo session={session} />
          </Card>

          <IzinForm onSubmit={handleSubmit} submitting={submitting} />
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
  pageContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
});
