import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { IzinStatusBadge } from '@/components/izin/IzinStatusBadge';
import { SessionInfo } from '@/components/session/SessionInfo';
import { AppBar } from '@/components/ui/AppBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { IZIN_STATUS_DESCRIPTION, IZIN_STATUS_LABEL } from '@/features/praktikan/izinMessages';
import { useIzinById, useSessionById } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { formatDateTime } from '@/utils/time';

export default function DetailIzinScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const izinId = Array.isArray(params.id) ? params.id[0] ?? '' : params.id ?? '';

  const izin = useIzinById(izinId);
  const session = useSessionById(izin?.sessionId ?? '');

  if (!izin) {
    return (
      <View style={styles.container}>
        <AppBar subtitle="Detail Izin" canGoBack onGoBack={() => router.back()} />
        <Screen edges={['left', 'right', 'bottom']}>
          <EmptyState
            title="Pengajuan tidak ditemukan"
            message="Data izin yang kamu cari tidak terdaftar."
            action={{ label: 'Kembali ke Daftar Izin', onPress: () => router.replace('/praktikan/izin') }}
          />
        </Screen>
      </View>
    );
  }

  const statusLabel = IZIN_STATUS_LABEL[izin.status] ?? 'Sedang Diproses';
  const statusDesc = IZIN_STATUS_DESCRIPTION[izin.status] ?? '';

  return (
    <View style={styles.container}>
      <AppBar subtitle="Detail Izin" canGoBack onGoBack={() => router.back()} />

      <Screen edges={['left', 'right', 'bottom']}>
        <View style={styles.content}>
          {/* Status Banner Card */}
          <View style={[styles.statusCard, izin.status === 'approved' && styles.statusCardApproved, izin.status === 'rejected' && styles.statusCardRejected]}>
            <View style={styles.statusHeaderRow}>
              <Text style={styles.statusTitle}>{statusLabel}</Text>
              <IzinStatusBadge status={izin.status} />
            </View>
            <Text style={styles.statusDescription}>{statusDesc}</Text>
            <Text style={styles.statusTime}>Diajukan pada: {formatDateTime(izin.createdAt)}</Text>
          </View>

          {/* Keputusan Asisten (Bila Sudah Direview) */}
          {izin.review ? (
            <Card>
              <Text style={styles.sectionHeader}>Keputusan Asisten Lab</Text>
              <View style={styles.reviewContent}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Hasil:</Text>
                  <Text
                    style={[
                      styles.reviewDecision,
                      izin.review.keputusan === 'approved'
                        ? styles.decisionApproved
                        : styles.decisionRejected,
                    ]}
                  >
                    {izin.review.keputusan === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                  </Text>
                </View>

                {izin.review.catatan ? (
                  <View style={styles.noteBox}>
                    <Text style={styles.noteTitle}>Catatan Asisten:</Text>
                    <Text style={styles.noteBody}>&ldquo;{izin.review.catatan}&rdquo;</Text>
                  </View>
                ) : null}

                <Text style={styles.reviewTime}>
                  Diverifikasi: {formatDateTime(izin.review.reviewedAt)}
                </Text>
              </View>
            </Card>
          ) : null}

          {/* Sesi Terkait */}
          {session ? (
            <Card>
              <Text style={styles.sectionHeader}>Sesi Praktikum Terkait</Text>
              <SessionInfo session={session} />
            </Card>
          ) : null}

          {/* Alasan yang Diajukan */}
          <Card>
            <Text style={styles.sectionHeader}>Alasan Ketidakhadiran</Text>
            <View style={styles.alasanBox}>
              <Text style={styles.alasanText}>{izin.alasan}</Text>
            </View>
          </Card>

          <Button
            label="Kembali ke Daftar Izin"
            variant="secondary"
            onPress={() => router.replace('/praktikan/izin')}
          />
        </View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.lg,
  },
  statusCard: {
    backgroundColor: '#F7F8FC',
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  statusCardApproved: {
    backgroundColor: '#F2FAF5',
    borderColor: '#A8DFBE',
  },
  statusCardRejected: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FFC7C7',
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusTitle: {
    ...typography.label,
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusDescription: {
    ...typography.body,
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 2,
  },
  statusTime: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  sectionHeader: {
    ...typography.label,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  reviewContent: {
    gap: spacing.sm,
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  reviewLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  reviewDecision: {
    ...typography.caption,
    fontWeight: '700',
  },
  decisionApproved: {
    color: '#14603A',
  },
  decisionRejected: {
    color: '#A32119',
  },
  noteBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 2,
  },
  noteTitle: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  noteBody: {
    ...typography.body,
    fontSize: 14,
    color: colors.text,
    fontStyle: 'italic',
  },
  reviewTime: {
    ...typography.caption,
    color: colors.textMuted,
  },
  alasanBox: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  alasanText: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
});
