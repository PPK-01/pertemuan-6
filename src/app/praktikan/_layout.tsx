import { Redirect, Stack } from 'expo-router';

import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function PraktikanLayout() {
  const role = useAppStore((state) => state.role);
  const currentUserId = useAppStore((state) => state.currentUserId);

  if (role !== 'praktikan' || !currentUserId) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sesi/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
