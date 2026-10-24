import { Stack } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { SessionCard } from '@/components/session/SessionCard';
import { STATUS_LABEL } from '@/components/session/statusLabel';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useAppStore, useSessionsForUser } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { SESSION_STATUS_LIST } from '@/types';
import type { SessionStatus } from '@/types';

type StatusFilter = SessionStatus | 'all';

type StatusFilterBarProps = {
  value: StatusFilter;
  onChange: (value: StatusFilter) => void;
};

function StatusFilterBar({ value, onChange }: StatusFilterBarProps) {
  return (
    <View role="radiogroup" aria-label="Filter status" style={styles.filterBar}>
      <Chip label="Semua" selected={value === 'all'} onPress={() => onChange('all')} />
      {SESSION_STATUS_LIST.map((status) => (
        <Chip
          key={status}
          label={STATUS_LABEL[status]}
          selected={value === status}
          onPress={() => onChange(status)}
        />
      ))}
    </View>
  );
}

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
  const [filter, setFilter] = useState<StatusFilter>('all');

  const visibleSessions = useMemo(
    () => (filter === 'all' ? sessions : sessions.filter((session) => session.status === filter)),
    [sessions, filter],
  );

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
        data={visibleSessions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <SessionCard session={item} />}
        ItemSeparatorComponent={ListSeparator}
        ListHeaderComponent={
          <View style={styles.headerContent}>
            {currentUser ? (
              <Text style={styles.identity}>Masuk sebagai {currentUser.name}</Text>
            ) : null}
            <StatusFilterBar value={filter} onChange={setFilter} />
          </View>
        }
        ListHeaderComponentStyle={styles.header}
        ListEmptyComponent={
          sessions.length === 0 || filter === 'all' ? (
            <EmptyState title="Belum ada sesi" message="Sesi yang dibuat akan muncul di sini." />
          ) : (
            <EmptyState
              title={`Tidak ada sesi yang ${STATUS_LABEL[filter].toLowerCase()}`}
              action={{ label: 'Tampilkan semua', onPress: () => setFilter('all') }}
            />
          )
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: spacing.xl },
  headerContent: { gap: spacing.md },
  identity: { ...typography.label, color: colors.textMuted },
  filterBar: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  separator: { height: spacing.md },
});
