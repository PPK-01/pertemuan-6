import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { layout, radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type SheetAction = Pick<ButtonProps, 'label' | 'onPress' | 'variant' | 'loading' | 'disabled'>;

export type BottomSheetProps = {
  visible: boolean;
  /** Dipanggil saat overlay ditekan dan saat tombol back Android. */
  onClose: () => void;
  title: string;
  children?: ReactNode;
  /** Variant default 'primary'. */
  primaryAction?: SheetAction;
  /** Biasanya { label: 'Batal', onPress: onClose }. Variant default 'secondary'. */
  secondaryAction?: SheetAction;
};

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  primaryAction,
  secondaryAction,
}: BottomSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable
          onPress={onClose}
          role="button"
          accessibilityLabel="Tutup"
          style={[StyleSheet.absoluteFill, styles.overlay]}
        />
        <View style={[styles.panel, { paddingBottom: spacing.lg + insets.bottom }]}>
          <Text style={styles.title}>{title}</Text>
          {children}
          {secondaryAction || primaryAction ? (
            <View style={styles.actions}>
              {secondaryAction ? (
                <Button
                  {...secondaryAction}
                  variant={secondaryAction.variant ?? 'secondary'}
                  style={styles.action}
                />
              ) : null}
              {primaryAction ? <Button {...primaryAction} style={styles.action} /> : null}
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  overlay: { backgroundColor: colors.overlay },
  panel: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: { ...typography.heading, color: colors.text },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
