import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

/** Panjang digit kode sesi presensi praktikum. */
const SESSION_CODE_LENGTH = 4;

export type PresensiFormProps = {
  code: string;
  onChangeCode: (code: string) => void;
  onSubmit: () => void;
  error?: string;
};

export function PresensiForm({ code, onChangeCode, onSubmit, error }: PresensiFormProps) {
  const canSubmit = code.length === SESSION_CODE_LENGTH;

  function handleChange(text: string) {
    onChangeCode(text.replace(/\D/g, '').slice(0, SESSION_CODE_LENGTH));
  }

  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.title}>Presensi</Text>
          <Text style={styles.description}>
            Masukkan {SESSION_CODE_LENGTH} digit kode sesi yang dibagikan asisten.
          </Text>
        </View>
        <TextField
          label="Kode sesi"
          value={code}
          onChangeText={handleChange}
          placeholder="0000"
          hint={`${SESSION_CODE_LENGTH} digit angka`}
          keyboardType="number-pad"
          maxLength={SESSION_CODE_LENGTH}
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
