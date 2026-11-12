import { useEffect } from 'react';
import { DefaultTheme, Stack, router, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import { LoadingState } from '@/components/ui/LoadingState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { observeAuth } from '@/services/auth';
import { useAppStore, useAuthStatus, useCurrentUser, useIsOnline } from '@/store/appStore';
import { colors } from '@/theme/colors';

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.feedback.danger.text,
  },
};

export default function RootLayout() {
  const currentUser = useCurrentUser();
  const authStatus = useAuthStatus();
  const isOnline = useIsOnline();
  const segments = useSegments();
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  // 1. Inisialisasi Auth Observer
  useEffect(() => {
    const unsubscribe = observeAuth((user) => {
      setCurrentUser(user);
    });
    return () => {
      unsubscribe();
    };
  }, [setCurrentUser]);

  // 2. Proteksi Rute (Route Guarding / Role Gate)
  useEffect(() => {
    if (authStatus === 'loading') return;

    const rootSegment = (segments[0] as string | undefined) ?? '';
    const inAuthGroup = rootSegment === '(auth)';
    const inAsistenGroup = rootSegment === 'asisten';
    const inPraktikanGroup = rootSegment === 'praktikan';

    if (!currentUser) {
      // Belum login, arahkan ke login jika mencoba buka rute terproteksi
      if (!inAuthGroup) {
        router.replace('/(auth)/login');
      }
    } else {
      // Sudah login tapi masih di layar auth
      if (inAuthGroup) {
        if (currentUser.role === 'asisten') {
          router.replace('/asisten');
        } else {
          router.replace('/praktikan/jadwal');
        }
        return;
      }

      // Lindungi rute lintas peran (FR-17)
      if (currentUser.role === 'praktikan' && inAsistenGroup) {
        router.replace('/praktikan/jadwal');
      } else if (currentUser.role === 'asisten' && inPraktikanGroup) {
        router.replace('/asisten');
      }
    }
  }, [currentUser, authStatus, segments]);

  if (authStatus === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style="light" />
        <LoadingState message="Memeriksa sesi login Rawuh..." />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="light" />
      {!isOnline ? <OfflineBanner /> : null}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      />
    </View>
  );
}
