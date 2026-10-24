import { Redirect, Stack } from 'expo-router';

import { GantiPeranButton } from '@/features/praktikan/GantiPeranButton';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';

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
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontSize: typography.heading.fontSize,
          fontWeight: typography.heading.fontWeight,
          color: colors.text,
        },
        headerShadowVisible: false,
        headerRight: () => <GantiPeranButton />,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="sesi/[id]" options={{ title: 'Detail sesi' }} />
    </Stack>
  );
}
