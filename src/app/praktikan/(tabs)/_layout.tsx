import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { ColorValue } from 'react-native';

import { GantiPeranButton } from '@/features/praktikan/GantiPeranButton';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Ukuran frame pembungkus ikon tab bar. */
const ICON_FRAME_SIZE = 24;

/** Ukuran dan ketebalan garis ikon. */
const ICON_SIZE = 20;
const ICON_BORDER_WIDTH = 1.5;

/** Dimensi elemen kalender (header dan titik tanggal). */
const CALENDAR_HEADER_HEIGHT = 5;
const CALENDAR_DOT_SIZE = 3;
const CALENDAR_DOT_RADIUS = 1.5;

/** Dimensi dan posisi jarum jam (jam dan menit). */
const CLOCK_HOUR_WIDTH = 1.5;
const CLOCK_HOUR_HEIGHT = 5;
const CLOCK_HOUR_TOP = 4;
const CLOCK_MINUTE_WIDTH = 4;
const CLOCK_MINUTE_HEIGHT = 1.5;
const CLOCK_MINUTE_LEFT = 9;
const CLOCK_HAND_RADIUS = 1;

type TabIconProps = {
  name: 'calendar' | 'clock';
  color: ColorValue;
};

function TabIcon({ name, color }: TabIconProps) {
  if (name === 'calendar') {
    return (
      <View style={styles.iconFrame}>
        <View style={[styles.calendar, { borderColor: color }]}>
          <View style={[styles.calendarHeader, { backgroundColor: color }]} />
          <View style={styles.calendarDots}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <View style={[styles.dot, { backgroundColor: color }]} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.iconFrame}>
      <View style={[styles.clock, { borderColor: color }]}>
        <View style={[styles.clockHour, { backgroundColor: color }]} />
        <View style={[styles.clockMinute, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function PraktikanTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitle: 'Presensi Praktikum',
        headerTitleStyle: {
          fontSize: typography.heading.fontSize,
          fontWeight: typography.heading.fontWeight,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerRight: () => <GantiPeranButton />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
        },
        tabBarLabelStyle: {
          fontSize: typography.caption.fontSize,
          fontWeight: typography.label.fontWeight,
        },
      }}
    >
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ color }) => <TabIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
          tabBarIcon: ({ color }) => <TabIcon name="clock" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconFrame: {
    width: ICON_FRAME_SIZE,
    height: ICON_FRAME_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderWidth: ICON_BORDER_WIDTH,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  calendarHeader: { height: CALENDAR_HEADER_HEIGHT },
  calendarDots: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  dot: {
    width: CALENDAR_DOT_SIZE,
    height: CALENDAR_DOT_SIZE,
    borderRadius: CALENDAR_DOT_RADIUS,
  },
  clock: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderWidth: ICON_BORDER_WIDTH,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHour: {
    position: 'absolute',
    width: CLOCK_HOUR_WIDTH,
    height: CLOCK_HOUR_HEIGHT,
    borderRadius: CLOCK_HAND_RADIUS,
    top: CLOCK_HOUR_TOP,
  },
  clockMinute: {
    position: 'absolute',
    width: CLOCK_MINUTE_WIDTH,
    height: CLOCK_MINUTE_HEIGHT,
    borderRadius: CLOCK_HAND_RADIUS,
    left: CLOCK_MINUTE_LEFT,
  },
});
