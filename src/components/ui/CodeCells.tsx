import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type CodeCellsProps = {
  /** Nilai kode 4 karakter atau kurang. */
  value?: string;
  /** Varian tampilan motif sel kode. */
  variant: 'display-navy' | 'input-light' | 'signature-navy';
  /** Indeks sel yang sedang aktif/fokus (0..3). */
  activeIndex?: number;
};

export function CodeCells({ value = '', variant, activeIndex = -1 }: CodeCellsProps) {
  const chars = [
    value[0] ?? '',
    value[1] ?? '',
    value[2] ?? '',
    value[3] ?? '',
  ];

  if (variant === 'signature-navy') {
    return (
      <View style={styles.row}>
        {chars.map((_, i) => (
          <View
            key={i}
            style={[
              styles.cellSignature,
              i === 0 ? styles.cellSignatureActive : styles.cellSignatureInactive,
            ]}
          />
        ))}
      </View>
    );
  }

  if (variant === 'display-navy') {
    return (
      <View style={styles.row}>
        {chars.map((char, i) => (
          <View key={i} style={styles.cellDisplayNavy}>
            <Text style={styles.textDisplayNavy}>{char || '-'}</Text>
          </View>
        ))}
      </View>
    );
  }

  // variant === 'input-light'
  return (
    <View style={styles.row}>
      {chars.map((char, i) => {
        const isActive = i === activeIndex;
        const isFilled = char.length > 0;
        return (
          <View
            key={i}
            style={[
              styles.cellInputLight,
              isFilled && styles.cellInputFilled,
              isActive && styles.cellInputActive,
            ]}
          >
            <Text style={styles.textInputLight}>{char}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  cellSignature: {
    width: 38,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
  },
  cellSignatureActive: {
    borderColor: colors.accent,
    backgroundColor: 'rgba(255, 196, 0, 0.12)',
  },
  cellSignatureInactive: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  cellDisplayNavy: {
    width: 64,
    height: 74,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  textDisplayNavy: {
    fontSize: typography.code.fontSize,
    lineHeight: typography.code.lineHeight,
    fontWeight: typography.code.fontWeight,
    fontVariant: typography.code.fontVariant,
    color: colors.primary,
  },
  cellInputLight: {
    width: 60,
    height: 68,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellInputFilled: {
    borderColor: colors.text,
  },
  cellInputActive: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  textInputLight: {
    fontSize: 32,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    color: colors.text,
  },
});
