import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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
import { TextField } from '@/components/ui/TextField';
import {
  validateConfirmPassword,
  validateEmail,
  validateInviteCode,
  validateName,
  validatePassword,
} from '@/features/auth/authValidation';
import { useAppStore, useKelasList } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Role } from '@/types';

export default function DaftarScreen() {
  const insets = useSafeAreaInsets();
  const register = useAppStore((state) => state.register);
  const kelasList = useKelasList();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('praktikan');
  const [selectedKelas, setSelectedKelas] = useState<string>('A');
  const [inviteCode, setInviteCode] = useState('');

  const [nameError, setNameError] = useState<string | undefined>();
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [inviteError, setInviteError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  // Ambil daftar kelas unik dari kelasPraktikum
  const availableKelas = useMemo(() => {
    const set = new Set<string>();
    kelasList.forEach((k) => set.add(k.kelas));
    const arr = Array.from(set);
    return arr.length > 0 ? arr.sort() : ['A', 'B'];
  }, [kelasList]);

  async function handleRegister() {
    setGeneralError(undefined);

    const nameCheck = validateName(name);
    if (!nameCheck.isValid) {
      setNameError(nameCheck.error);
      return;
    }
    setNameError(undefined);

    const emailCheck = validateEmail(email);
    if (!emailCheck.isValid) {
      setEmailError(emailCheck.error);
      return;
    }
    setEmailError(undefined);

    const passCheck = validatePassword(password);
    if (!passCheck.isValid) {
      setPasswordError(passCheck.error);
      return;
    }
    setPasswordError(undefined);

    const confirmCheck = validateConfirmPassword(password, confirmPassword);
    if (!confirmCheck.isValid) {
      setConfirmError(confirmCheck.error);
      return;
    }
    setConfirmError(undefined);

    if (role === 'asisten') {
      const codeCheck = validateInviteCode(inviteCode);
      if (!codeCheck.isValid) {
        setInviteError(codeCheck.error);
        return;
      }
      setInviteError(undefined);
    }

    setSubmitting(true);
    const result = await register({
      name,
      email,
      password,
      role,
      kelas: role === 'praktikan' ? selectedKelas : undefined,
      inviteCode: role === 'asisten' ? inviteCode : undefined,
    });
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
        {/* Header */}
        <View style={[styles.navyHeader, { paddingTop: insets.top + spacing.lg }]}>
          <Text style={styles.appName}>Rawuh</Text>
          <Text style={styles.sheetTitleLight}>Registrasi Akun</Text>
        </View>

        {/* Sheet Content */}
        <View
          style={[
            styles.sheetContainer,
            { paddingBottom: Math.max(insets.bottom, spacing.xl) },
          ]}
        >
          <View style={styles.sheetContent}>
            {generalError ? <Banner tone="danger" message={generalError} /> : null}

            {/* Pilihan Peran */}
            <View style={styles.section}>
              <Text style={styles.label}>Pilih Peran:</Text>
              <View style={styles.roleRow}>
                <Pressable
                  style={[
                    styles.roleTab,
                    role === 'praktikan' && styles.roleTabActive,
                  ]}
                  onPress={() => setRole('praktikan')}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: role === 'praktikan' }}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      role === 'praktikan' && styles.roleTabTextActive,
                    ]}
                  >
                    Praktikan
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.roleTab,
                    role === 'asisten' && styles.roleTabActive,
                  ]}
                  onPress={() => setRole('asisten')}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: role === 'asisten' }}
                >
                  <Text
                    style={[
                      styles.roleTabText,
                      role === 'asisten' && styles.roleTabTextActive,
                    ]}
                  >
                    Asisten Lab
                  </Text>
                </Pressable>
              </View>
            </View>

            {/* Form Fields */}
            <View style={styles.formGroup}>
              <TextField
                label="Nama Lengkap"
                placeholder="Contoh: Bagas Saputra"
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (nameError) setNameError(undefined);
                }}
                error={nameError}
              />

              <TextField
                label="Email Kampus"
                placeholder="nama@rawuh.ac.id"
                value={email}
                onChangeText={(t) => {
                  setEmail(t);
                  if (emailError) setEmailError(undefined);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                error={emailError}
              />

              {role === 'praktikan' ? (
                <View style={styles.section}>
                  <Text style={styles.label}>Pilih Kelas:</Text>
                  <View style={styles.kelasRow}>
                    {availableKelas.map((k) => {
                      const isSelected = selectedKelas === k;
                      return (
                        <Pressable
                          key={k}
                          style={[
                            styles.kelasPill,
                            isSelected && styles.kelasPillActive,
                          ]}
                          onPress={() => setSelectedKelas(k)}
                        >
                          <Text
                            style={[
                              styles.kelasPillText,
                              isSelected && styles.kelasPillTextActive,
                            ]}
                          >
                            Kelas {k}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              ) : (
                <TextField
                  label="Kode Undangan Asisten"
                  placeholder="Masukkan kode undangan khusus"
                  value={inviteCode}
                  onChangeText={(t) => {
                    setInviteCode(t);
                    if (inviteError) setInviteError(undefined);
                  }}
                  autoCapitalize="characters"
                  hint="Didapatkan dari pengelola laboratorium"
                  error={inviteError}
                />
              )}

              <TextField
                label="Kata Sandi (Min. 8 Karakter)"
                placeholder="Masukkan kata sandi baru"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  if (passwordError) setPasswordError(undefined);
                }}
                secureTextEntry
                error={passwordError}
              />

              <TextField
                label="Konfirmasi Kata Sandi"
                placeholder="Ulangi kata sandi"
                value={confirmPassword}
                onChangeText={(t) => {
                  setConfirmPassword(t);
                  if (confirmError) setConfirmError(undefined);
                }}
                secureTextEntry
                error={confirmError}
              />
            </View>

            <Button
              label={submitting ? 'Mendaftarkan...' : 'Daftar Sekarang'}
              disabled={submitting || !name || !email || !password || !confirmPassword}
              onPress={handleRegister}
            />

            <View style={styles.footerLinkRow}>
              <Text style={styles.footerText}>Sudah memiliki akun?</Text>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/(auth)/login')}
              >
                <Text style={styles.linkText}>Masuk di sini</Text>
              </Pressable>
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
    paddingBottom: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  appName: {
    ...typography.display,
    fontSize: 28,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  sheetTitleLight: {
    ...typography.body,
    color: colors.accent,
    fontWeight: '600',
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
  section: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  roleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roleTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleTabText: {
    ...typography.label,
    color: colors.text,
  },
  roleTabTextActive: {
    color: colors.onPrimary,
  },
  kelasRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  kelasPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  kelasPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  kelasPillText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  kelasPillTextActive: {
    color: colors.onPrimary,
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
});
