import { router, Stack } from 'expo-router';
import { useRef, useState } from 'react';

import { Screen } from '@/components/ui/Screen';
import { SessionForm } from '@/features/asisten/SessionForm';
import { useAppStore } from '@/store/appStore';
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
    createSession({ ...input, createdBy: currentUserId });
    router.back();
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Buat sesi' }} />
      <SessionForm onSubmit={handleSubmit} submitting={submitting} />
    </Screen>
  );
}
