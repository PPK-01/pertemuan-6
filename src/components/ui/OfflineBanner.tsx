import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type OfflineBannerProps = {
  message?: string;
};

export function OfflineBanner({
  message = 'Tidak ada koneksi internet. Mode baca aktif, aksi tulis dinonaktifkan.',
}: OfflineBannerProps) {
  return (
    <View style={styles.banner}>
      <View style={styles.dot} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF1C2',
    borderColor: '#E6A700',
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: '#B25900',
  },
  text: {
    ...typography.caption,
    color: '#5E3B00',
    fontWeight: '600',
    flex: 1,
  },
});
