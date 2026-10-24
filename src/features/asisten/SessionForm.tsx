import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { TextField } from '@/components/ui/TextField';
import { formatDateInput, validateSessionForm } from '@/features/asisten/sessionFormValidation';
import type { SessionFormValues } from '@/features/asisten/sessionFormValidation';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { KELAS_LIST, PRAKTIKUM_LIST } from '@/types';
import type { CreateSessionInput } from '@/types';

export type SessionFormProps = {
  onSubmit: (input: Omit<CreateSessionInput, 'createdBy'>) => void;
  submitting?: boolean;
};

type ChoiceGroupProps<T extends string> = {
  label: string;
  options: readonly T[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
};

// Label dan pesan error meniru TextField agar kolom pilihan sejajar dengan kolom ketik.
function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
}: ChoiceGroupProps<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View role="radiogroup" aria-label={label} style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option}
            label={option}
            selected={value === option}
            onPress={() => onChange(option)}
          />
        ))}
      </View>
      {error ? (
        <Text aria-live="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function SessionForm({ onSubmit, submitting = false }: SessionFormProps) {
  const [values, setValues] = useState<SessionFormValues>(() => ({
    praktikum: null,
    kelas: null,
    topik: '',
    ruang: '',
    tanggal: formatDateInput(new Date()),
    jamMulai: '',
    jamSelesai: '',
  }));
  // Error baru tampil setelah submit pertama, lalu ikut nilai terbaru agar hilang begitu diperbaiki.
  const [attempted, setAttempted] = useState(false);

  const result = useMemo(() => validateSessionForm(values), [values]);
  const errors = attempted && !result.ok ? result.errors : {};
  const showBanner = attempted && !result.ok;

  function setField<K extends keyof SessionFormValues>(key: K, value: SessionFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit() {
    setAttempted(true);
    if (result.ok) {
      onSubmit(result.input);
    }
  }

  return (
    <View style={styles.form}>
      <View style={styles.fields}>
        <ChoiceGroup
          label="Praktikum"
          options={PRAKTIKUM_LIST}
          value={values.praktikum}
          onChange={(value) => setField('praktikum', value)}
          error={errors.praktikum}
        />
        <ChoiceGroup
          label="Kelas"
          options={KELAS_LIST}
          value={values.kelas}
          onChange={(value) => setField('kelas', value)}
          error={errors.kelas}
        />
        <TextField
          label="Topik"
          value={values.topik}
          onChangeText={(text) => setField('topik', text)}
          placeholder="Mis. Navigasi Expo Router"
          error={errors.topik}
          maxLength={60}
          autoCapitalize="sentences"
        />
        <TextField
          label="Ruang"
          value={values.ruang}
          onChangeText={(text) => setField('ruang', text)}
          placeholder="Mis. Lab 2"
          error={errors.ruang}
          maxLength={30}
          autoCapitalize="sentences"
        />
        <TextField
          label="Tanggal"
          value={values.tanggal}
          onChangeText={(text) => setField('tanggal', text)}
          hint="Contoh: 28/10/2026"
          error={errors.tanggal}
          keyboardType="numeric"
          maxLength={10}
        />
        <TextField
          label="Jam mulai"
          value={values.jamMulai}
          onChangeText={(text) => setField('jamMulai', text)}
          placeholder="09.00"
          hint="Contoh: 09.00"
          error={errors.jamMulai}
          keyboardType="numeric"
          maxLength={5}
        />
        <TextField
          label="Jam selesai"
          value={values.jamSelesai}
          onChangeText={(text) => setField('jamSelesai', text)}
          placeholder="11.00"
          hint="Contoh: 09.00"
          error={errors.jamSelesai}
          keyboardType="numeric"
          maxLength={5}
        />
      </View>

      <View style={styles.actions}>
        {showBanner ? (
          <Banner
            tone="danger"
            message="Ada isian yang belum benar. Periksa pesan di tiap kolom."
          />
        ) : null}
        <Button label="Buat sesi" onPress={handleSubmit} loading={submitting} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: spacing.xl },
  fields: { gap: spacing.md },
  field: { gap: spacing.sm },
  label: { ...typography.label, color: colors.text },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { ...typography.caption, color: colors.feedback.danger.text },
  actions: { gap: spacing.md },
});
