import { StyleSheet, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type PresensiFormProps = {
  code: string;
  onChangeCode: (code: string) => void;
  onSubmit: () => void;
  error?: string;
  banner?: ReactNode;
};

export function PresensiForm({
  code,
  onChangeCode,
  onSubmit,
  error,
  banner,
}: PresensiFormProps) {
  const canSubmit = code.length === 4;

  function handleChange(text: string) {
    onChangeCode(text.replace(/\D/g, '').slice(0, 4));
  }

  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.title}>Presensi</Text>
          <Text style={styles.description}>
            Masukkan 4 digit kode sesi yang dibagikan asisten.
          </Text>
        </View>
        {banner}
        <TextField
          label="Kode sesi"
          value={code}
          onChangeText={handleChange}
          placeholder="0000"
          hint="4 digit angka"
          keyboardType="number-pad"
          maxLength={4}
          error={error}
        />
        <Button label="Presensi" onPress={onSubmit} disabled={!canSubmit} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md },
  copy: { gap: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  description: { ...typography.body, color: colors.textMuted },
});
