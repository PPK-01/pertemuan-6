import type { Tabs } from 'expo-router';
import { router } from 'expo-router';
import { useState } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { useAppStore, useSessionsForUser } from '@/store/appStore';
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
  const currentUserId = useAppStore((store) => store.currentUserId);
  const sessions = useSessionsForUser(currentUserId ?? '');
  const [sheetVisible, setSheetVisible] = useState(false);

  function handleCenterPress() {
    // Cari sesi yang sedang dibuka
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
      router.push(route.name === 'jadwal' ? '/praktikan/jadwal' : '/praktikan/riwayat');
    }
  }

  return (
    <>
      <View style={[styles.barContainer, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]}>
        {/* Tab 1: Jadwal */}
        {(() => {
          const isFocused = state.index === 0;
          const route = state.routes[0];
          if (!route) return null;

          const onPress = () => {
            if (!isFocused) {
              handleNavigate(route);
            }
          };

          const tintColor = isFocused ? colors.primary : colors.textMuted;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
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

        {/* Tombol Bulat Tengah Sadar-Konteks: "Isi kode" */}
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

        {/* Tab 2: Riwayat */}
        {(() => {
          const isFocused = state.index === 1;
          const route = state.routes[1];
          if (!route) return null;

          const onPress = () => {
            if (!isFocused) {
              handleNavigate(route);
            }
          };

          const tintColor = isFocused ? colors.primary : colors.textMuted;

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
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
          Belum ada sesi yang dibuka. Cek jadwal.
        </Text>
      </BottomSheet>
    </>
  );
}

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.minTouch,
    gap: 2,
  },
  iconPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: 'rgba(0, 20, 74, 0.08)',
  },
  tabLabel: {
    fontSize: typography.caption.fontSize,
    lineHeight: 14,
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -24,
    minHeight: layout.minTouch,
    minWidth: layout.minTouch,
    paddingHorizontal: spacing.sm,
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
  iconFrame: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarBody: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  calendarTopBar: {
    height: 4,
    width: '100%',
  },
  calendarDotsRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 3,
    justifyContent: 'center',
  },
  calendarDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 1,
  },
  clockCircle: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  clockHourHand: {
    position: 'absolute',
    width: 1.5,
    height: 4,
    top: 4,
    borderRadius: 1,
  },
  clockMinuteHand: {
    position: 'absolute',
    width: 3.5,
    height: 1.5,
    left: 8,
    borderRadius: 1,
  },
  keyIconFrame: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyMiniGrid: {
    flexDirection: 'row',
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyMiniCell: {
    width: 4.5,
    height: 8,
    borderRadius: 1,
    backgroundColor: colors.accent,
    opacity: 0.5,
  },
  keyMiniCellActive: {
    width: 5,
    height: 10,
    borderRadius: 1,
    backgroundColor: colors.accent,
  },
  sheetBody: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.text,
  },
});
