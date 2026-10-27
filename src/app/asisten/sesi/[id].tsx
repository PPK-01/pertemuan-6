import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CodeDisplay } from '@/components/session/CodeDisplay';
import { SessionInfo } from '@/components/session/SessionInfo';
import { AppBar } from '@/components/ui/AppBar';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { RekapList } from '@/features/asisten/RekapList';
import { StatusActionSheet } from '@/features/asisten/StatusActionSheet';
import type { StatusAction } from '@/features/asisten/StatusActionSheet';
import { useAppStore, useRekap, useSessionById } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type Feedback = { tone: 'success' | 'danger'; message: string };

const SUCCESS_MESSAGE: Record<StatusAction, string> = {
  open: 'Sesi dibuka',
  close: 'Sesi ditutup',
};

export default function AsistenDetailSesiScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const session = useSessionById(sessionId);
  const rekap = useRekap(sessionId);
  const openSession = useAppStore((state) => state.openSession);
  const closeSession = useAppStore((state) => state.closeSession);

  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetAction, setSheetAction] = useState<StatusAction>('open');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  if (!session) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Detail sesi" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Sesi tidak ditemukan"
            message="Sesi mungkin sudah dihapus atau tautan tidak valid."
            action={{ label: 'Kembali ke daftar sesi', onPress: () => router.back() }}
          />
        </Screen>
      </View>
    );
  }

  const showSheet = (action: StatusAction) => {
    setSheetAction(action);
    setSheetVisible(true);
  };

  const handleConfirm = () => {
    setSheetVisible(false);
    const actionFn = sheetAction === 'open' ? openSession : closeSession;
    const ok = actionFn(session.id);
    if (ok) {
      setFeedback({ tone: 'success', message: SUCCESS_MESSAGE[sheetAction] });
    } else {
      setFeedback({
        tone: 'danger',
        message:
          sheetAction === 'open'
            ? 'Gagal membuka sesi. Sesi mungkin sudah dibuka atau ditutup.'
            : 'Gagal menutup sesi. Hanya sesi yang sedang dibuka yang bisa ditutup.',
      });
    }
  };

  return (
    <View style={styles.container}>
      <AppBar subtitle="Detail sesi" canGoBack onGoBack={() => router.back()} />
      <Screen edges={['left', 'right', 'bottom']}>
        <View style={styles.page}>
          {feedback ? <Banner tone={feedback.tone} message={feedback.message} /> : null}

          <Card>
            <SessionInfo session={session} />
          </Card>

          {session.status === 'open' ? (
            <CodeDisplay
              code={session.code}
              hint="Bagikan kode ini ke kelas."
            />
          ) : null}

          {session.status === 'scheduled' ? (
            <Button label="Buka sesi" onPress={() => showSheet('open')} />
          ) : session.status === 'open' ? (
            <Button label="Tutup sesi" variant="danger" onPress={() => showSheet('close')} />
          ) : feedback ? null : (
            <Banner tone="info" message="Sesi sudah ditutup." />
          )}

          <View style={styles.section}>
            <Text role="heading" style={styles.sectionTitle}>
              Rekap kehadiran
            </Text>
            {session.status === 'scheduled' ? (
              <Text style={styles.sectionHint}>Rekap muncul setelah sesi dibuka.</Text>
            ) : rekap ? (
              <RekapList rekap={rekap} />
            ) : null}
          </View>

          <StatusActionSheet
            visible={sheetVisible}
            action={sheetAction}
            kelas={session.kelas}
            onConfirm={handleConfirm}
            onClose={() => setSheetVisible(false)}
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  page: {
    gap: spacing.xl,
    paddingVertical: spacing.md,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.heading,
    color: colors.text,
  },
  sectionHint: {
    ...typography.body,
    color: colors.textMuted,
  },
});
