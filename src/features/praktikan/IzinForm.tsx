import { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { validateAlasanIzin } from './izinValidation';
import { useIsOnline } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type IzinFormProps = {
  onSubmit: (sanitizedAlasan: string) => Promise<void>;
  submitting?: boolean;
};

export function IzinForm({ onSubmit, submitting = false }: IzinFormProps) {
  const isOnline = useIsOnline();
  const [alasan, setAlasan] = useState('');
  const [error, setError] = useState<string | undefined>();

  const trimmedLength = alasan.trim().length;
  const isTooShort = trimmedLength < 10;
  const isTooLong = trimmedLength > 500;
  const canSubmit = !isTooShort && !isTooLong && isOnline && !submitting;

  async function handlePressSubmit() {
    const check = validateAlasanIzin(alasan);
    if (!check.isValid) {
      setError(check.error);
      return;
    }
    setError(undefined);
    await onSubmit(check.sanitizedAlasan);
  }

  return (
    <View style={styles.container}>
      {!isOnline ? (
        <Banner
          tone="info"
          message="Tidak ada koneksi. Pengajuan izin memerlukan koneksi internet."
        />
      ) : null}

      <View style={styles.infoBanner}>
        <Text style={styles.infoText}>
          Tuliskan alasan ketidakhadiran dengan jelas (mis. sakit, urusan keluarga, atau kegiatan akademik). Alasan akan dianalisis oleh AI kampus dan diverifikasi oleh asisten praktikum.
        </Text>
      </View>

      <View style={styles.fieldBlock}>
        <View style={styles.labelRow}>
          <Text style={styles.label}>Alasan Ketidakhadiran</Text>
          <Text
            style={[
              styles.counter,
              isTooLong && styles.counterError,
              trimmedLength >= 10 && !isTooLong && styles.counterOk,
            ]}
          >
            {trimmedLength} / 500
          </Text>
        </View>

        <TextInput
          style={[
            styles.textArea,
            error && styles.textAreaError,
            !isOnline && styles.textAreaDisabled,
          ]}
          value={alasan}
          onChangeText={(t) => {
            setAlasan(t);
            if (error) setError(undefined);
          }}
          placeholder="Tulis alasan izinmu di sini (minimal 10 karakter)..."
          placeholderTextColor={colors.textMuted}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          editable={!submitting && isOnline}
          maxLength={550}
          aria-label="Alasan ketidakhadiran"
        />

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <Button
        label={submitting ? 'Mengirim Pengajuan...' : 'Kirim Pengajuan Izin'}
        disabled={!canSubmit}
        onPress={handlePressSubmit}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  infoBanner: {
    backgroundColor: '#E0E8FB',
    borderColor: '#2A4AD0',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  infoText: {
    ...typography.caption,
    color: '#1B2F8F',
    lineHeight: 18,
  },
  fieldBlock: {
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.label,
    color: colors.text,
  },
  counter: {
    ...typography.caption,
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  counterOk: {
    color: '#14603A',
    fontWeight: '600',
  },
  counterError: {
    color: colors.feedback.danger.text,
    fontWeight: '700',
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 120,
    color: colors.text,
    ...Platform.select({
      web: { outlineWidth: 0 } as const,
    }),
  },
  textAreaError: {
    borderColor: colors.feedback.danger.text,
    borderWidth: 2,
  },
  textAreaDisabled: {
    backgroundColor: '#E3E7F2',
    color: '#66708C',
  },
  errorText: {
    ...typography.caption,
    color: colors.feedback.danger.text,
    fontWeight: '600',
  },
});
