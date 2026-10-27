import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type CodeInputProps = {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CodeInput({
  value,
  onChange,
  error,
  disabled = false,
  style,
}: CodeInputProps) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);
  const [focused, setFocused] = useState(false);

  const digits = value.slice(0, 4).split('');
  const activeIndex = Math.min(digits.length, 3);

  function handleChange(text: string) {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    onChange(cleaned);
  }

  function handlePress() {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }

  return (
    <View style={[styles.container, style]}>
      <Pressable
        onPress={handlePress}
        accessible
        accessibilityRole="none"
        accessibilityLabel="Area input kode sesi 4 digit"
        style={styles.cellRow}
      >
        {[0, 1, 2, 3].map((index) => {
          const char = digits[index] ?? '';
          const isCurrent = focused && index === activeIndex;

          return (
            <View
              key={index}
              style={[
                styles.cell,
                isCurrent && styles.cellActive,
                Boolean(error) && styles.cellError,
                disabled && styles.cellDisabled,
              ]}
            >
              <Text style={[styles.digit, disabled && styles.digitDisabled]}>
                {char}
              </Text>
            </View>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        editable={!disabled}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={4}
        accessibilityLabel="Kode sesi, 4 digit"
        accessibilityHint="Ketik 4 digit angka yang dibagikan asisten"
        style={styles.hiddenInput}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    alignItems: 'center',
    width: '100%',
  },
  cellRow: {
    flexDirection: 'row',
    gap: spacing.md,
    justifyContent: 'center',
    paddingVertical: spacing.xs,
  },
  cell: {
    width: 64,
    height: 76,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  cellError: {
    borderColor: colors.feedback.danger.text,
  },
  cellDisabled: {
    backgroundColor: colors.disabled.bg,
    borderColor: colors.disabled.text,
  },
  digit: {
    ...typography.code,
    color: colors.text,
  },
  digitDisabled: {
    color: colors.disabled.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },
  errorText: {
    ...typography.caption,
    color: colors.feedback.danger.text,
    textAlign: 'center',
  },
});
