import { Tabs } from 'expo-router';

import { PraktikanTabBar } from '@/features/praktikan/PraktikanTabBar';

export default function PraktikanTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <PraktikanTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="jadwal"
        options={{
          title: 'Jadwal',
        }}
      />
      <Tabs.Screen
        name="riwayat"
        options={{
          title: 'Riwayat',
        }}
      />
    </Tabs>
  );
}
