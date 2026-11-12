import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { useAppStore, useCurrentUser, useSessionsForUser } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type TabBarProps = {
  state: {
    index: number;
    routes: { key: string; name: string }[];
  };
  navigation?: {
    navigate: (name: string) => void;
  };
  navigateToTab?: (key: string) => void;
};

function CalendarIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.calendarBody, { borderColor: color }]}>
        <View style={[styles.calendarTopBar, { backgroundColor: color }]} />
        <View style={styles.calendarDotsRow}>
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
          <View style={[styles.calendarDot, { backgroundColor: color }]} />
        </View>
      </View>
    </View>
  );
}

function DocumentIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.docBody, { borderColor: color }]}>
        <View style={[styles.docLine, { backgroundColor: color }]} />
        <View style={[styles.docLineShort, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function ClockIcon({ color }: { color: string }) {
  return (
    <View style={styles.iconFrame}>
      <View style={[styles.clockCircle, { borderColor: color }]}>
        <View style={[styles.clockHourHand, { backgroundColor: color }]} />
        <View style={[styles.clockMinuteHand, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

function KeyCodeIcon() {
  return (
    <View style={styles.keyIconFrame}>
      <View style={styles.keyMiniGrid}>
        <View style={styles.keyMiniCellActive} />
        <View style={styles.keyMiniCell} />
        <View style={styles.keyMiniCell} />
        <View style={styles.keyMiniCell} />
      </View>
    </View>
  );
}

export function PraktikanTabBar(props: TabBarProps) {
  const { state } = props;
  const insets = useSafeAreaInsets();
  const currentUser = useCurrentUser();
  const sessions = useSessionsForUser(currentUser?.id ?? '');
  const [sheetVisible, setSheetVisible] = useState(false);

  function handleCenterPress() {
    const openSession = sessions.find((s) => s.status === 'open');
    if (openSession) {
      router.push({
        pathname: '/praktikan/sesi/[id]',
        params: { id: openSession.id },
      });
    } else {
      setSheetVisible(true);
    }
  }

  function handleNavigate(route: { key: string; name: string }) {
    if (props.navigateToTab) {
      props.navigateToTab(route.key);
    } else if (props.navigation) {
      props.navigation.navigate(route.name);
    } else {
      if (route.name === 'jadwal') router.push('/praktikan/jadwal');
      else if (route.name === 'izin') router.push('/praktikan/izin');
      else router.push('/praktikan/riwayat');
    }
  }

  return (
    <>
      <View style={[styles.barContainer, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
        {/* Tab 1: Jadwal */}
        {(() => {
          const route = state.routes.find((r) => r.name === 'jadwal');
          if (!route) return null;
          const isFocused = state.routes[state.index]?.name === 'jadwal';
          const tintColor = isFocused ? colors.primary : colors.textMuted;

          return (
            <Pressable
              key={route.key}
              onPress={() => !isFocused && handleNavigate(route)}
              role="tab"
              aria-selected={isFocused}
              aria-label="Jadwal praktikum"
              style={({ pressed }) => [
                styles.tabItem,
                pressed && { opacity: PRESSED_OPACITY },
              ]}
            >
              <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                <CalendarIcon color={tintColor} />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                Jadwal
              </Text>
            </Pressable>
          );
        })()}

        {/* Tab 2: Izin (BARU Sprint 2) */}
        {(() => {
          const route = state.routes.find((r) => r.name === 'izin');
          if (!route) return null;
          const isFocused = state.routes[state.index]?.name === 'izin';
          const tintColor = isFocused ? colors.primary : colors.textMuted;

          return (
            <Pressable
              key={route.key}
              onPress={() => !isFocused && handleNavigate(route)}
              role="tab"
              aria-selected={isFocused}
              aria-label="Pengajuan izin"
              style={({ pressed }) => [
                styles.tabItem,
                pressed && { opacity: PRESSED_OPACITY },
              ]}
            >
              <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                <DocumentIcon color={tintColor} />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                Izin
              </Text>
            </Pressable>
          );
        })()}

        {/* Tombol Bulat Tengah: Isi Kode */}
        <Pressable
          onPress={handleCenterPress}
          role="button"
          aria-label="Isi kode sesi praktikum"
          style={({ pressed }) => [
            styles.centerButtonWrapper,
            pressed && { opacity: PRESSED_OPACITY },
          ]}
        >
          <View style={styles.centerButtonCircle}>
            <KeyCodeIcon />
          </View>
          <Text style={styles.centerButtonLabel}>Isi kode</Text>
        </Pressable>

        {/* Tab 3: Riwayat */}
        {(() => {
          const route = state.routes.find((r) => r.name === 'riwayat');
          if (!route) return null;
          const isFocused = state.routes[state.index]?.name === 'riwayat';
          const tintColor = isFocused ? colors.primary : colors.textMuted;

          return (
            <Pressable
              key={route.key}
              onPress={() => !isFocused && handleNavigate(route)}
              role="tab"
              aria-selected={isFocused}
              aria-label="Riwayat presensi"
              style={({ pressed }) => [
                styles.tabItem,
                pressed && { opacity: PRESSED_OPACITY },
              ]}
            >
              <View style={[styles.iconPill, isFocused && styles.iconPillActive]}>
                <ClockIcon color={tintColor} />
              </View>
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
                Riwayat
              </Text>
            </Pressable>
          );
        })()}
      </View>

      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Belum ada sesi yang dibuka"
        primaryAction={{
          label: 'Tutup',
          onPress: () => setSheetVisible(false),
        }}
      >
        <Text style={styles.sheetBody}>
          Belum ada sesi praktikum kelasmu yang sedang dibuka saat ini. Silakan periksa tab Jadwal.
        </Text>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTouch,
    gap: 2,
  },
  iconPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  iconPillActive: {
    backgroundColor: '#E0E8FB',
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  centerButtonCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.surface,
  },
  centerButtonLabel: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  iconFrame: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBody: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    overflow: 'hidden',
    alignItems: 'center',
  },
  calendarTopBar: {
    width: '100%',
    height: 4,
  },
  calendarDotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
  },
  calendarDot: {
    width: 3,
    height: 3,
    borderRadius: 1,
  },
  docBody: {
    width: 16,
    height: 19,
    borderRadius: 3,
    borderWidth: 1.5,
    padding: 2,
    gap: 3,
    justifyContent: 'center',
  },
  docLine: {
    width: 8,
    height: 2,
    borderRadius: 1,
  },
  docLineShort: {
    width: 5,
    height: 2,
    borderRadius: 1,
  },
  clockCircle: {
    width: 18,
    height: 18,
    borderRadius: radius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHourHand: {
    position: 'absolute',
    width: 1.5,
    height: 5,
    top: 4,
  },
  clockMinuteHand: {
    position: 'absolute',
    width: 5,
    height: 1.5,
    right: 4,
  },
  keyIconFrame: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 14,
    height: 14,
    gap: 2,
  },
  keyMiniCellActive: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  keyMiniCell: {
    width: 5,
    height: 5,
    borderRadius: 1,
    backgroundColor: colors.onPrimary,
    opacity: 0.7,
  },
  sheetBody: {
    ...typography.body,
    color: colors.text,
  },
});
