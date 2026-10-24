import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { SessionInfo } from '@/components/session/SessionInfo';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { StatusActionSheet } from '@/features/asisten/StatusActionSheet';
import type { StatusAction } from '@/features/asisten/StatusActionSheet';
import { useAppStore, useSessionById } from '@/store/appStore';
import { spacing } from '@/theme/spacing';

type Feedback = { tone: 'success' | 'danger'; message: string };

const SUCCESS_MESSAGE: Record<StatusAction, string> = {
  open: 'Sesi dibuka. Bagikan kode sesi ke praktikan.',
  close: 'Sesi ditutup.',
};

export default function AsistenDetailSesiScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const session = useSessionById(sessionId);
  const openSession = useAppStore((state) => state.openSession);
  const closeSession = useAppStore((state) => state.closeSession);

  const [sheetVisible, setSheetVisible] = useState(false);
  // Terpisah dari sheetVisible agar isi sheet tidak berganti selama animasi tutup.
  const [sheetAction, setSheetAction] = useState<StatusAction>('open');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!session) {
    return (
      <Screen>
        <Stack.Screen options={{ title: 'Detail sesi' }} />
        <EmptyState
          title="Sesi tidak ditemukan"
          message="Sesi mungkin sudah tidak tersedia."
          action={{ label: 'Kembali ke daftar', onPress: () => router.replace('/asisten') }}
        />
      </Screen>
    );
  }

  function showSheet(action: StatusAction) {
    setSheetAction(action);
    setSheetVisible(true);
  }

  function handleConfirm() {
    const ok = sheetAction === 'open' ? openSession(sessionId) : closeSession(sessionId);
    setSheetVisible(false);
    setFeedback(
      ok
        ? { tone: 'success', message: SUCCESS_MESSAGE[sheetAction] }
        : {
            tone: 'danger',
            message: 'Status sesi sudah berubah. Muat ulang detail sesi dan coba lagi.',
          },
    );
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Detail sesi' }} />
      <View style={styles.page}>
        {feedback ? <Banner tone={feedback.tone} message={feedback.message} /> : null}

        <Card>
          <SessionInfo session={session} />
        </Card>

        {session.status === 'scheduled' ? (
          <Button label="Buka sesi" onPress={() => showSheet('open')} />
        ) : session.status === 'open' ? (
          <Button label="Tutup sesi" variant="danger" onPress={() => showSheet('close')} />
        ) : feedback ? null : (
          <Banner tone="info" message="Sesi sudah ditutup. Praktikan tidak bisa presensi lagi." />
        )}
      </View>

      <StatusActionSheet
        visible={sheetVisible}
        action={sheetAction}
        kelas={session.kelas}
        onConfirm={handleConfirm}
        onClose={() => setSheetVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
});
