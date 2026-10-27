import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CodeInput } from '@/components/ui/CodeInput';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const SESSION_CODE_LENGTH = 4;

export type PresensiFormProps = {
  code: string;
  onChangeCode: (code: string) => void;
  onSubmit: () => void;
  error?: string;
};

export function PresensiForm({ code, onChangeCode, onSubmit, error }: PresensiFormProps) {
  const canSubmit = code.length === SESSION_CODE_LENGTH;

  return (
    <Card>
      <View style={styles.content}>
        <View style={styles.copy}>
          <Text style={styles.title}>Kode sesi</Text>
          <Text style={styles.description}>
            Masukkan 4 digit kode dari asisten.
          </Text>
        </View>

        <CodeInput value={code} onChange={onChangeCode} error={error} />

        <Button label="Presensi" onPress={onSubmit} disabled={!canSubmit} />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.md, alignItems: 'stretch' },
  copy: { gap: spacing.xs },
  title: { ...typography.heading, color: colors.text },
  description: { ...typography.body, color: colors.textMuted },
});
