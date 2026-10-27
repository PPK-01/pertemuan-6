import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBar } from '@/components/ui/AppBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { IdentityCard } from '@/components/ui/IdentityCard';
import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { Screen } from '@/components/ui/Screen';
import { Tile } from '@/components/ui/Tile';
import { SessionListItem } from '@/features/asisten/SessionListItem';
import { useAppStore, useCurrentUser, useSessionsForUser } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Session, SessionStatus } from '@/types';

type StatusFilter = SessionStatus | 'all';

function PlusIcon() {
  return (
    <View style={styles.plusBox}>
      <View style={styles.plusHorizontal} />
      <View style={styles.plusVertical} />
    </View>
  );
}

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function AsistenHomeScreen() {
  const insets = useSafeAreaInsets();
  const currentUser = useCurrentUser();
  const currentUserId = useAppStore((state) => state.currentUserId);
  const resetIdentity = useAppStore((state) => state.resetIdentity);
  const sessions = useSessionsForUser(currentUserId ?? '');

  const [filter, setFilter] = useState<StatusFilter>('all');

  const counts = useMemo<Record<StatusFilter, number>>(() => {
    const acc: Record<StatusFilter, number> = {
      all: sessions.length,
      scheduled: 0,
      open: 0,
      closed: 0,
    };
    for (const session of sessions) {
      acc[session.status] = (acc[session.status] ?? 0) + 1;
    }
    return acc;
  }, [sessions]);

  const filteredSessions = useMemo(
    () => (filter === 'all' ? sessions : sessions.filter((s) => s.status === filter)),
    [sessions, filter],
  );

  const openCreate = () => router.push('/asisten/buat');

  return (
    <View style={styles.container}>
      <AppBar subtitle="Sesi" />

      <Screen scroll={false} edges={['left', 'right']}>
        <View style={styles.screenInner}>
          <FlatList
            data={filteredSessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <SessionListItem session={item} />}
            ItemSeparatorComponent={ListSeparator}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.headerBlock}>
                {currentUser ? (
                  <IdentityCard
                    name={currentUser.name}
                    keyInfo="Asisten Lab"
                    supportingInfo="Laboratorium Komputer"
                    onGantiPeran={resetIdentity}
                  />
                ) : null}

                <View
                  role="radiogroup"
                  aria-label="Filter status sesi"
                  style={styles.tilesGrid}
                >
                  <Tile
                    label="Semua"
                    count={counts.all}
                    iconType="all"
                    selected={filter === 'all'}
                    onPress={() => setFilter('all')}
                  />
                  <Tile
                    label="Dijadwalkan"
                    count={counts.scheduled}
                    iconType="scheduled"
                    selected={filter === 'scheduled'}
                    onPress={() => setFilter('scheduled')}
                  />
                  <Tile
                    label="Dibuka"
                    count={counts.open}
                    iconType="open"
                    selected={filter === 'open'}
                    onPress={() => setFilter('open')}
                  />
                  <Tile
                    label="Ditutup"
                    count={counts.closed}
                    iconType="closed"
                    selected={filter === 'closed'}
                    onPress={() => setFilter('closed')}
                  />
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="Belum ada sesi"
                message="Buat sesi untuk membuka presensi."
                action={{ label: 'Buat sesi', onPress: openCreate }}
              />
            }
          />
        </View>
      </Screen>

      {/* Bar bawah polos dengan tombol bulat tengah "Buat sesi" */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
        <Pressable
          onPress={openCreate}
          role="button"
          aria-label="Buat sesi"
          style={({ pressed }) => [
            styles.centerButtonWrapper,
            pressed && { opacity: PRESSED_OPACITY },
          ]}
        >
          <View style={styles.centerButtonCircle}>
            <PlusIcon />
          </View>
          <Text style={styles.centerButtonLabel}>Buat sesi</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  screenInner: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl + 40,
  },
  headerBlock: {
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  tilesGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  separator: {
    height: spacing.sm,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xs,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    minHeight: layout.minTouch,
    minWidth: layout.minTouch,
  },
  centerButtonCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primary,
    borderWidth: 3.5,
    borderColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButtonLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: 14,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 2,
  },
  plusBox: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  plusHorizontal: {
    position: 'absolute',
    width: 14,
    height: 2.5,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
  plusVertical: {
    position: 'absolute',
    width: 2.5,
    height: 14,
    backgroundColor: colors.accent,
    borderRadius: 1,
  },
});
