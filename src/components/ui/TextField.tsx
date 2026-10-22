import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, TextInputProps, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type TextFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  /** Teks bantuan di bawah input, mis. format input. */
  hint?: string;
  /** Ada nilai = state error; pesan ini menggantikan hint. */
  error?: string;
  keyboardType?: TextInputProps['keyboardType'];
  maxLength?: number;
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Khusus layout (margin, flex, alignSelf), bukan warna/ukuran. */
  style?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  error,
  keyboardType,
  maxLength,
  autoCapitalize,
  style,
}: TextFieldProps) {
  const hasError = Boolean(error);
  const message = hasError ? error : hint;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={label}
        accessibilityHint={message}
        style={[styles.input, hasError && styles.inputError]}
      />
      {message ? (
        <Text style={[styles.message, hasError && styles.messageError]}>{message}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  input: {
    ...typography.body,
    color: colors.text,
    minHeight: layout.minTouch,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: { borderColor: colors.feedback.danger.text },
  message: { ...typography.caption, color: colors.textMuted },
  messageError: { color: colors.feedback.danger.text },
});
