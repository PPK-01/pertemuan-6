import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Button';
import { CodeCells } from '@/components/ui/CodeCells';
import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Role, User } from '@/types';

const ROLES: { role: Role; label: string; description: string }[] = [
  {
    role: 'praktikan',
    label: 'Praktikan',
    description: 'Lihat jadwal kelas dan catat kehadiran.',
  },
  {
    role: 'asisten',
    label: 'Asisten Lab',
    description: 'Buka sesi, tunjukkan kode, dan pantau rekap.',
  },
];

function CheckmarkIcon() {
  return (
    <View style={styles.checkFrame}>
      <View style={styles.checkStemShort} />
      <View style={styles.checkStemLong} />
    </View>
  );
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <View style={styles.radioCore} /> : null}
    </View>
  );
}

export default function PilihPeranScreen() {
  const insets = useSafeAreaInsets();
  const users = useAppStore((state) => state.users);
  const storeRole = useAppStore((state) => state.role);
  const storeUserId = useAppStore((state) => state.currentUserId);
  const setRole = useAppStore((state) => state.setRole);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  const [selectedRole, setSelectedRole] = useState<Role | null>(storeRole);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(storeUserId);

  const identityOptions = useMemo(
    () => users.filter((user) => user.role === selectedRole),
    [users, selectedRole],
  );

  const canContinue = selectedRole !== null && selectedUserId !== null;

  function handleRoleChange(role: Role) {
    if (role === selectedRole) return;
    setSelectedRole(role);
    setSelectedUserId(null);
  }

  function handleContinue() {
    if (!selectedRole || !selectedUserId) return;
    setRole(selectedRole);
    setCurrentUser(selectedUserId);
    router.replace(selectedRole === 'asisten' ? '/asisten' : '/praktikan/jadwal');
  }

  return (
    <View style={styles.screenContainer}>
      {/* Bagian atas navy (±38%) */}
      <View style={[styles.navyHeader, { paddingTop: insets.top + spacing.lg }]}>
        <View style={styles.headerContent}>
          <Text style={styles.appName}>Rawuh</Text>
          <Text style={styles.tagline}>
            Presensi praktikum dengan kode 4 digit.
          </Text>
          <View style={styles.signatureMotif}>
            <CodeCells variant="signature-navy" />
          </View>
        </View>
      </View>

      {/* Lembar terang bersudut atas membulat */}
      <View style={[styles.sheetContainer, { paddingBottom: Math.max(insets.bottom, spacing.lg) }]}>
        <View style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Masuk sebagai</Text>

          {/* Dua ubin peran */}
          <View role="radiogroup" aria-label="Pilih peran" style={styles.roleTilesRow}>
            {ROLES.map((item) => {
              const active = selectedRole === item.role;
              return (
                <Pressable
                  key={item.role}
                  onPress={() => handleRoleChange(item.role)}
                  role="radio"
                  aria-checked={active}
                  aria-label={`${item.label}, ${item.description}`}
                  style={({ pressed }) => [
                    styles.roleTile,
                    active && styles.roleTileActive,
                    pressed && { opacity: PRESSED_OPACITY },
                  ]}
                >
                  <View style={styles.roleTileHeader}>
                    <Text style={[styles.roleTileLabel, active && styles.roleTileLabelActive]}>
                      {item.label}
                    </Text>
                    {active ? <CheckmarkIcon /> : null}
                  </View>
                  <Text style={styles.roleTileDesc}>{item.description}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Pilih nama */}
          {selectedRole ? (
            <View style={styles.identitySection}>
              <Text style={styles.identitySectionTitle}>Pilih nama</Text>
              <View
                role="radiogroup"
                aria-label={`Daftar nama ${selectedRole}`}
                style={styles.identityList}
              >
                {identityOptions.map((user: User) => {
                  const selected = selectedUserId === user.id;
                  const label = user.kelas ? `${user.name} (Kelas ${user.kelas})` : user.name;
                  return (
                    <Pressable
                      key={user.id}
                      onPress={() => setSelectedUserId(user.id)}
                      role="radio"
                      aria-checked={selected}
                      aria-label={label}
                      style={({ pressed }) => [
                        styles.radioRow,
                        selected && styles.radioRowSelected,
                        pressed && { opacity: PRESSED_OPACITY },
                      ]}
                    >
                      <RadioDot selected={selected} />
                      <View style={styles.radioTextWrap}>
                        <Text style={[styles.radioName, selected && styles.radioNameSelected]}>
                          {user.name}
                        </Text>
                        {user.kelas ? (
                          <Text style={styles.radioSub}>Kelas {user.kelas}</Text>
                        ) : null}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          {/* Tombol Lanjut */}
          <View style={styles.buttonWrapper}>
            <Button
              label="Lanjut"
              disabled={!canContinue}
              onPress={handleContinue}
              accessibilityLabel="Lanjut ke halaman utama"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  navyHeader: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignItems: 'center',
    gap: spacing.sm,
  },
  appName: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '700',
    color: colors.onPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    color: colors.onPrimary,
    opacity: 0.85,
    textAlign: 'center',
  },
  signatureMotif: {
    marginTop: spacing.md,
  },
  sheetContainer: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.identity,
    borderTopRightRadius: radius.identity,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sheetContent: {
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  sheetTitle: {
    fontSize: typography.heading.fontSize,
    lineHeight: typography.heading.lineHeight,
    fontWeight: typography.heading.fontWeight,
    color: colors.text,
    marginBottom: spacing.md,
  },
  roleTilesRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  roleTile: {
    flex: 1,
    minHeight: layout.minTouch + 24,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.tile,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  roleTileActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    backgroundColor: 'rgba(0, 20, 74, 0.04)',
  },
  roleTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  roleTileLabel: {
    fontSize: typography.heading.fontSize,
    fontWeight: '700',
    color: colors.text,
  },
  roleTileLabelActive: {
    color: colors.primary,
  },
  roleTileDesc: {
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
    color: colors.textMuted,
  },
  checkFrame: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkStemShort: {
    position: 'absolute',
    width: 2,
    height: 5,
    backgroundColor: colors.onPrimary,
    transform: [{ rotate: '-45deg' }, { translateX: -2.5 }, { translateY: 0.5 }],
  },
  checkStemLong: {
    position: 'absolute',
    width: 2,
    height: 9,
    backgroundColor: colors.onPrimary,
    transform: [{ rotate: '45deg' }, { translateX: 1.5 }, { translateY: -1 }],
  },
  identitySection: {
    flex: 1,
    gap: spacing.sm,
  },
  identitySectionTitle: {
    fontSize: typography.label.fontSize,
    fontWeight: typography.label.fontWeight,
    color: colors.textMuted,
  },
  identityList: {
    gap: spacing.sm,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.minTouch,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.md,
  },
  radioRowSelected: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 20, 74, 0.03)',
  },
  radioTextWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  radioName: {
    fontSize: typography.body.fontSize,
    fontWeight: '600',
    color: colors.text,
  },
  radioNameSelected: {
    color: colors.primary,
  },
  radioSub: {
    fontSize: typography.caption.fontSize,
    color: colors.textMuted,
    fontWeight: typography.label.fontWeight,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioCore: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  buttonWrapper: {
    marginTop: spacing.lg,
  },
});
