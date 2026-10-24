import { Tabs } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import type { ColorValue } from 'react-native';

import { GantiPeranButton } from '@/features/praktikan/GantiPeranButton';
import { colors } from '@/theme/colors';
import { radius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

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
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendar: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  calendarHeader: { height: 5 },
  calendarDots: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  dot: { width: 3, height: 3, borderRadius: 1.5 },
  clock: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clockHour: {
    position: 'absolute',
    width: 1.5,
    height: 5,
    borderRadius: 1,
    top: 4,
  },
  clockMinute: {
    position: 'absolute',
    width: 4,
    height: 1.5,
    borderRadius: 1,
    left: 9,
  },
});
