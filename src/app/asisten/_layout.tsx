import { Redirect, Stack } from 'expo-router';

import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';

export default function AsistenLayout() {
  const role = useAppStore((state) => state.role);
  const currentUserId = useAppStore((state) => state.currentUserId);

  // Juga menangani "Ganti peran": resetIdentity() mengosongkan identitas lalu guard ini mengarahkan ke /.
  if (role !== 'asisten' || !currentUserId) {
    return <Redirect href="/" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
