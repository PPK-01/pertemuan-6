import { StyleSheet, Text } from 'react-native';

import { BottomSheet } from '@/components/ui/BottomSheet';
import { colors } from '@/theme/colors';
import { typography } from '@/theme/typography';
import type { Kelas } from '@/types';

export type StatusAction = 'open' | 'close';

export type StatusActionSheetProps = {
  visible: boolean;
  action: StatusAction;
  kelas: Kelas;
  onConfirm: () => void;
  onClose: () => void;
};

export function StatusActionSheet({
  visible,
  action,
  kelas,
  onConfirm,
  onClose,
}: StatusActionSheetProps) {
  const isOpen = action === 'open';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={isOpen ? 'Buka sesi' : 'Tutup sesi'}
      primaryAction={{
        label: isOpen ? 'Buka sesi' : 'Tutup sesi',
        variant: isOpen ? 'primary' : 'danger',
        onPress: onConfirm,
      }}
      secondaryAction={{ label: 'Batal', onPress: onClose }}
    >
      <Text style={styles.body}>
        {isOpen
          ? `Setelah dibuka, praktikan kelas ${kelas} bisa presensi memakai kode sesi.`
          : 'Praktikan tidak bisa presensi lagi setelah sesi ditutup.'}
      </Text>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  body: { ...typography.body, color: colors.text },
});
