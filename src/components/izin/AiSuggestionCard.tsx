import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import type { AiResult } from '@/types';

export type AiSuggestionCardProps = {
  ai?: AiResult;
};

export function AiSuggestionCard({ ai }: AiSuggestionCardProps) {
  if (!ai) {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>Saran Analisis AI</Text>
        <Text style={styles.mutedText}>Sedang memproses analisis...</Text>
      </View>
    );
  }

  if (ai.state === 'failed') {
    return (
      <View style={[styles.card, styles.failedCard]}>
        <View style={styles.header}>
          <Text style={[styles.title, styles.failedTitle]}>Analisis AI Tidak Tersedia</Text>
          <View style={styles.tagFailed}>
            <Text style={styles.tagTextFailed}>{ai.errorCode}</Text>
          </View>
        </View>
        <Text style={styles.failedDesc}>
          Layanan AI tidak dapat menganalisis alasan secara otomatis. Anda tetap dapat memutuskan izin ini secara manual.
        </Text>
      </View>
    );
  }

  const isAccepted = ai.keputusan === 'diterima';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Saran Analisis AI</Text>
        <View style={[styles.badge, isAccepted ? styles.badgeAccepted : styles.badgeRejected]}>
          <Text style={[styles.badgeText, isAccepted ? styles.badgeTextAccepted : styles.badgeTextRejected]}>
            Saran: {isAccepted ? 'Diterima' : 'Ditolak'}
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Kategori:</Text>
        <Text style={styles.value}>{ai.kategori.toUpperCase()}</Text>
      </View>

      {ai.alasan ? (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>&ldquo;{ai.alasan}&rdquo;</Text>
        </View>
      ) : null}

      <Text style={styles.disclaimer}>
        * Catatan: Saran AI hanya referensi pendukung. Keputusan mutlak berada di tangan Asisten Lab.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#F7F8FC',
    borderColor: '#D0D6E5',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.sm,
  },
  failedCard: {
    backgroundColor: '#FFF8F0',
    borderColor: '#FFD9B3',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
  },
  mutedText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  failedTitle: {
    color: '#8A4200',
  },
  tagFailed: {
    backgroundColor: '#FFE2C6',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  tagTextFailed: {
    ...typography.caption,
    color: '#8A4200',
    fontWeight: '700',
  },
  failedDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  badgeAccepted: {
    backgroundColor: '#DDF1E4',
  },
  badgeRejected: {
    backgroundColor: '#FBE3E1',
  },
  badgeText: {
    ...typography.caption,
    fontWeight: '700',
  },
  badgeTextAccepted: {
    color: '#14603A',
  },
  badgeTextRejected: {
    color: '#A32119',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textMuted,
  },
  value: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  explanationBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
  },
  explanationText: {
    ...typography.caption,
    color: colors.text,
    fontStyle: 'italic',
  },
  disclaimer: {
    ...typography.caption,
    fontSize: 11,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
