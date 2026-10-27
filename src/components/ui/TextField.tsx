import { useState } from 'react';
import { Platform, StyleSheet, Text, TextInput, View } from 'react-native';
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

const BORDER_WIDTH = 1;
const FOCUS_BORDER_WIDTH = 2;
const FOCUS_INSET = FOCUS_BORDER_WIDTH - BORDER_WIDTH;

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
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const message = hasError ? error : hint;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize}
        aria-label={label}
        aria-describedby={message ? `${label}-hint` : undefined}
        aria-invalid={hasError}
        style={[
          styles.input,
          hasError && styles.inputError,
          focused && !hasError && styles.inputFocused,
        ]}
      />
      {message ? (
        <Text
          nativeID={`${label}-hint`}
          style={[styles.message, hasError && styles.messageError]}
        >
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { ...typography.label, color: colors.text },
  input: {
    ...typography.body,
    minHeight: layout.minTouch,
    borderWidth: BORDER_WIDTH,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...Platform.select({
      web: { outlineWidth: 0 } as const,
    }),
  },
  inputFocused: {
    borderColor: colors.primary,
    borderWidth: FOCUS_BORDER_WIDTH,
    paddingHorizontal: spacing.md - FOCUS_INSET,
    paddingVertical: spacing.sm - FOCUS_INSET,
  },
  inputError: {
    borderColor: colors.feedback.danger.text,
    borderWidth: FOCUS_BORDER_WIDTH,
    paddingHorizontal: spacing.md - FOCUS_INSET,
    paddingVertical: spacing.sm - FOCUS_INSET,
  },
  message: { ...typography.caption, color: colors.textMuted },
  messageError: { color: colors.feedback.danger.text },
});
