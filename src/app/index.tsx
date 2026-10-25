import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { PRESSED_OPACITY } from '@/components/ui/pressable';
import { Screen } from '@/components/ui/Screen';
import { useAppStore } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { Role, User } from '@/types';

const ROLE_OPTIONS: { role: Role; label: string; description: string }[] = [
  {
    role: 'praktikan',
    label: 'Praktikan',
    description: 'Lihat jadwal kelas dan catat kehadiran.',
  },
  {
    role: 'asisten',
    label: 'Asisten',
    description: 'Kelola sesi dan pantau rekap kehadiran.',
  },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <View style={[styles.radio, selected && styles.radioSelected]}>
      {selected ? <View style={styles.radioCore} /> : null}
    </View>
  );
}

function InitialsBadge({ name }: { name: string }) {
  return (
    <View aria-hidden style={styles.initialsBadge}>
      <Text style={styles.initialsText}>{getInitials(name)}</Text>
    </View>
  );
}

export default function PilihPeranScreen() {
  const { width } = useWindowDimensions();
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

  const twoColumns = width >= 640;
  const canContinue = selectedRole !== null && selectedUserId !== null;
  const buttonLabel = getContinueLabel(selectedRole);

  function handleRoleChange(role: Role) {
    if (role === selectedRole) {
      return;
    }
    setSelectedRole(role);
    setSelectedUserId(null);
  }

  function handleContinue() {
    if (!selectedRole || !selectedUserId) {
      return;
    }
    setRole(selectedRole);
    setCurrentUser(selectedUserId);
    router.replace(
      selectedRole === 'asisten' ? '/asisten' : '/praktikan/jadwal',
    );
  }

  return (
    <Screen edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.page}>
        <View style={styles.intro}>
          <Text style={styles.title}>Presensi Praktikum</Text>
          <Text style={styles.subtitle}>
            Pilih peran dan identitas untuk mencatat kehadiran praktikum.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Masuk sebagai</Text>
          <View role="radiogroup" style={styles.roleGroup}>
            {ROLE_OPTIONS.map((option) => {
              const selected = selectedRole === option.role;
              return (
                <Pressable
                  key={option.role}
                  onPress={() => handleRoleChange(option.role)}
                  role="radio"
                  aria-checked={selected}
                  style={({ pressed }) => [
                    styles.optionRow,
                    selected && styles.optionRowSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <RadioDot selected={selected} />
                  <View style={styles.optionText}>
                    <Text style={styles.optionTitle}>{option.label}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilih identitas</Text>
          {selectedRole === null ? (
            <Text style={styles.hint}>Pilih peran dulu untuk melihat daftar identitas.</Text>
          ) : (
            <View
              role="radiogroup"
              style={[styles.identityGroup, twoColumns && styles.identityGroupWide]}
            >
              {identityOptions.map((user) => {
                const selected = selectedUserId === user.id;
                return (
                  <Pressable
                    key={user.id}
                    onPress={() => setSelectedUserId(user.id)}
                    role="radio"
                    aria-checked={selected}
                    style={({ pressed }) => [
                      styles.identityRow,
                      twoColumns && styles.identityRowWide,
                      selected && styles.optionRowSelected,
                      pressed && styles.pressed,
                    ]}
                  >
                    <InitialsBadge name={user.name} />
                    <View style={styles.optionText}>
                      <Text style={styles.identityName}>{user.name}</Text>
                      <Text style={styles.optionDescription}>{identityDetail(user)}</Text>
                    </View>
                    <RadioDot selected={selected} />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Button label={buttonLabel} onPress={handleContinue} disabled={!canContinue} />
          <Text style={styles.note}>
            Mode demo. Data kembali ke kondisi awal saat aplikasi ditutup.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function getContinueLabel(role: Role | null): string {
  if (role === 'asisten') {
    return 'Masuk sebagai Asisten';
  }
  if (role === 'praktikan') {
    return 'Masuk sebagai Praktikan';
  }
  return 'Lanjutkan';
}

/** Ukuran badge inisial nama (diameter lingkaran). */
const INITIALS_BADGE_SIZE = 36;

/** Ukuran dan ketebalan tombol radio pilihan. */
const RADIO_SIZE = 20;
const RADIO_BORDER_WIDTH = 2;
const RADIO_CORE_SIZE = 10;

function identityDetail(user: User): string {
  return user.kelas ? `Kelas ${user.kelas}` : 'Asisten';
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  intro: { gap: spacing.sm, paddingTop: spacing.sm },
  title: { ...typography.display, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.heading, color: colors.text },
  roleGroup: { gap: spacing.sm },
  identityGroup: { gap: spacing.sm },
  identityGroupWide: { flexDirection: 'row', flexWrap: 'wrap' },
  optionRow: {
    minHeight: layout.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  optionRowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  pressed: { opacity: PRESSED_OPACITY },
  optionText: { flex: 1, gap: spacing.xs },
  optionTitle: { ...typography.body, fontWeight: typography.label.fontWeight, color: colors.text },
  optionDescription: {
    ...typography.label,
    fontWeight: typography.body.fontWeight,
    color: colors.textMuted,
  },
  identityRow: {
    minHeight: layout.minTouch,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  identityRowWide: { flexBasis: '48%', flexGrow: 1 },
  identityName: { ...typography.body, fontWeight: typography.label.fontWeight, color: colors.text },
  initialsBadge: {
    width: INITIALS_BADGE_SIZE,
    height: INITIALS_BADGE_SIZE,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  initialsText: { ...typography.label, color: colors.textMuted },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: radius.full,
    borderWidth: RADIO_BORDER_WIDTH,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioCore: {
    width: RADIO_CORE_SIZE,
    height: RADIO_CORE_SIZE,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  hint: { ...typography.body, color: colors.textMuted },
  footer: { gap: spacing.md, paddingTop: spacing.sm },
  note: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
