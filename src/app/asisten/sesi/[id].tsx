import { router, Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { SessionInfo } from '@/components/session/SessionInfo';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useSessionById } from '@/store/appStore';
import { spacing } from '@/theme/spacing';

export default function AsistenDetailSesiScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const sessionId = Array.isArray(params.id) ? (params.id[0] ?? '') : (params.id ?? '');

  const session = useSessionById(sessionId);

  return (
    <Screen>
      <Stack.Screen options={{ title: 'Detail sesi' }} />
      {session ? (
        <View style={styles.page}>
          <Card>
            <SessionInfo session={session} />
          </Card>
        </View>
      ) : (
        <EmptyState
          title="Sesi tidak ditemukan"
          message="Sesi mungkin sudah tidak tersedia."
          action={{ label: 'Kembali ke daftar', onPress: () => router.replace('/asisten') }}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
});
