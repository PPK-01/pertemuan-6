import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionInfo } from '@/components/session/SessionInfo';
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
  open: 'Sesi dibuka. Bagikan kode sesi ke praktikan.',
  close: 'Sesi ditutup.',
};

export default function AsistenDetailSesiScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const session = useSessionById(sessionId);
  const rekap = useRekap(sessionId);
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

        {session.status === 'open' ? (
          <Card>
            <View style={styles.code}>
              <Text style={styles.codeLabel}>Kode sesi</Text>
              {/* Digit dipisah spasi agar TalkBack membacanya per digit, bukan sebagai bilangan. */}
              <Text
                aria-label={`Kode sesi ${session.code.split('').join(' ')}`}
                style={styles.codeValue}
              >
                {session.code}
              </Text>
              <Text style={styles.codeHint}>
                {`Bagikan kode ini ke praktikan kelas ${session.kelas}.`}
              </Text>
            </View>
          </Card>
        ) : null}

        {session.status === 'scheduled' ? (
          <Button label="Buka sesi" onPress={() => showSheet('open')} />
        ) : session.status === 'open' ? (
          <Button label="Tutup sesi" variant="danger" onPress={() => showSheet('close')} />
        ) : feedback ? null : (
          <Banner tone="info" message="Sesi sudah ditutup. Praktikan tidak bisa presensi lagi." />
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
  code: { gap: spacing.sm },
  codeLabel: { ...typography.label, color: colors.textMuted },
  codeValue: {
    ...typography.display,
    color: colors.text,
    fontVariant: ['tabular-nums'],
    letterSpacing: 4, // bukan token, jarak antar digit kode
  },
  codeHint: { ...typography.body, color: colors.textMuted },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.heading, color: colors.text },
  sectionHint: { ...typography.body, color: colors.textMuted },
});
