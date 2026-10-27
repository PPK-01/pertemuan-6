import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppBar } from '@/components/ui/AppBar';
import { Screen } from '@/components/ui/Screen';
import { SessionForm } from '@/features/asisten/SessionForm';
import { useAppStore } from '@/store/appStore';
import { spacing } from '@/theme/spacing';
import type { CreateSessionInput } from '@/types';

export default function AsistenBuatSesiScreen() {
  const currentUserId = useAppStore((state) => state.currentUserId);
  const createSession = useAppStore((state) => state.createSession);
  const [submitting, setSubmitting] = useState(false);
  // State baru berlaku di render berikutnya; ref menahan tekanan beruntun sebelum itu.
  const submittingRef = useRef(false);

  function handleSubmit(input: Omit<CreateSessionInput, 'createdBy'>) {
    // Guard di asisten/_layout.tsx menjamin currentUserId terisi.
    if (submittingRef.current || !currentUserId) return;
    submittingRef.current = true;
    setSubmitting(true);
    const created = createSession({ ...input, createdBy: currentUserId });
    // replace, bukan push: back dari detail kembali ke daftar, bukan ke form.
    router.replace({ pathname: '/asisten/sesi/[id]', params: { id: created.id } });
  }

  return (
    <View style={styles.container}>
      <AppBar
        subtitle="Buat sesi"
        canGoBack
        onGoBack={() => router.back()}
      />
      <Screen edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          <SessionForm onSubmit={handleSubmit} submitting={submitting} />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.md,
  },
});
