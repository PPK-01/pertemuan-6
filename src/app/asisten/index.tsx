import { Stack } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { SessionCard } from '@/components/session/SessionCard';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useAppStore, useSessionsForUser } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function AsistenSessionListScreen() {
  const currentUserId = useAppStore((state) => state.currentUserId);
  const currentUser = useAppStore((state) =>
    state.users.find((user) => user.id === state.currentUserId),
  );
  const resetIdentity = useAppStore((state) => state.resetIdentity);
  // Guard di asisten/_layout.tsx menjamin currentUserId terisi.
  const sessions = useSessionsForUser(currentUserId ?? '');

  return (
    <Screen scroll={false}>
      <Stack.Screen
        options={{
          title: 'Sesi Praktikum',
          // Hanya mengosongkan identitas; navigasi ke / ditangani guard di asisten/_layout.tsx.
          headerRight: () => (
            <Button label="Ganti peran" variant="ghost" onPress={resetIdentity} />
          ),
        }}
      />
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionCard session={item} />}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={
          currentUser ? (
            <Text style={styles.identity}>Masuk sebagai {currentUser.name}</Text>
          ) : null
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          <EmptyState title="Belum ada sesi" message="Sesi yang dibuat akan muncul di sini." />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  identity: { ...typography.label, color: colors.textMuted },
  separator: { height: spacing.md },
});
