import { Redirect, Stack } from 'expo-router';
import { useCurrentUser } from '@/store/appStore';
import { colors } from '@/theme/colors';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function PraktikanLayout() {
  const currentUser = useCurrentUser();

  if (!currentUser || currentUser.role !== 'praktikan') {
    return <Redirect href="/(auth)/login" />;
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
      <Stack.Screen name="izin/baru" options={{ headerShown: false }} />
      <Stack.Screen name="izin/[id]" options={{ headerShown: false }} />
    </Stack>
  );
}
