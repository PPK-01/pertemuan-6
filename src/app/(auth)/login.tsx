import { router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { CodeCells } from '@/components/ui/CodeCells';
import { TextField } from '@/components/ui/TextField';
import { validateEmail } from '@/features/auth/authValidation';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const login = useAppStore((state) => state.login);
  const isOnline = useAppStore((state) => state.isOnline);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setGeneralError(undefined);

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error);
      return;
    }
    setEmailError(undefined);

    if (!password) {
      setPasswordError('Kata sandi wajib diisi');
      return;
    }
    setPasswordError(undefined);

    setSubmitting(true);
    const result = await login(email, password);
    setSubmitting(false);

    if (result.ok) {
      const user = result.data;
      if (user.role === 'asisten') {
        router.replace('/asisten');
      } else {
        router.replace('/praktikan/jadwal');
      }
    } else {
      setGeneralError(result.message);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.screenContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Navy Header */}
        <View style={[styles.navyHeader, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.headerContent}>
            <Text style={styles.appName}>Rawuh</Text>
            <Text style={styles.tagline}>Presensi praktikum dengan kode 4 digit.</Text>
            <View style={styles.signatureMotif}>
              <CodeCells variant="signature-navy" />
            </View>
          </View>
        </View>

        {/* White Form Sheet */}
        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, spacing.xl) },
          ]}
        >
          <View style={styles.sheetContent}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Masuk</Text>
              <Text style={styles.sheetSubtitle}>
                Silakan masuk dengan email kampus terdaftar.
              </Text>
            </View>

            {generalError ? (
              <Banner tone="danger" message={generalError} />
            ) : null}

            {!isOnline ? (
              <Banner
                tone="info"
                message="Perangkat sedang offline. Pastikan koneksi internet aktif untuk masuk."
              />
            ) : null}

            <View style={styles.formGroup}>
              <TextField
                label="Email Kampus"
                placeholder="nama@rawuh.ac.id"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(undefined);
                  if (generalError) setGeneralError(undefined);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />

              <TextField
                label="Kata Sandi"
                placeholder="Masukkan kata sandi"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError(undefined);
                  if (generalError) setGeneralError(undefined);
                }}
                secureTextEntry
                error={passwordError}
              />
            </View>

            <Button
              label={submitting ? 'Memeriksa...' : 'Masuk'}
              disabled={submitting || !email || !password}
              onPress={handleLogin}
            />

            {/* Link ke Registrasi */}
            <View style={styles.footerLinkRow}>
              <Text style={styles.footerText}>Belum memiliki akun?</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(auth)/daftar')}
              >
                <Text style={styles.linkText}>Daftar di sini</Text>
              </Pressable>
            </View>

            {/* Petunjuk akun demo */}
            <View style={styles.demoBox}>
              <Text style={styles.demoTitle}>Akun Percobaan Cepat:</Text>
              <Text style={styles.demoItem}>
                • Asisten: <Text style={styles.demoBold}>dina@rawuh.ac.id</Text>
              </Text>
              <Text style={styles.demoItem}>
                • Praktikan (Kelas A): <Text style={styles.demoBold}>bagas@rawuh.ac.id</Text>
              </Text>
              <Text style={styles.demoItem}>
                • Praktikan (Kelas A): <Text style={styles.demoBold}>citra@rawuh.ac.id</Text>
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  navyHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  appName: {
    ...typography.display,
    color: colors.onPrimary,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  tagline: {
    ...typography.body,
    fontSize: 15,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  signatureMotif: {
    marginTop: spacing.lg,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.identity,
    borderTopRightRadius: radius.identity,
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  sheetContent: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: spacing.lg,
  },
  sheetHeader: {
    gap: spacing.xs,
  },
  sheetTitle: {
    ...typography.title,
    color: colors.text,
  },
  sheetSubtitle: {
    ...typography.body,
    color: colors.textMuted,
    fontSize: 14,
  },
  formGroup: {
    gap: spacing.md,
  },
  footerLinkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
    paddingTop: spacing.xs,
  },
  footerText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
  },
  linkText: {
    ...typography.body,
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  demoBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
    marginTop: spacing.sm,
  },
  demoTitle: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  demoItem: {
    ...typography.caption,
    color: colors.textMuted,
  },
  demoBold: {
    fontWeight: '600',
    color: colors.primary,
  },
});
