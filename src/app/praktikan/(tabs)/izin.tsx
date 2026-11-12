import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import { IzinRow } from '@/components/izin/IzinRow';
import { AppBar } from '@/components/ui/AppBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { useCurrentUser, useIzinByUser, useSessionsForUser } from '@/store/appStore';
import { colors } from '@/theme/colors';
import { radius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

function ListSeparator() {
  return <View style={styles.separator} />;
}

export default function IzinListScreen() {
  const currentUser = useCurrentUser();
  const userId = currentUser?.id ?? '';
  const izinList = useIzinByUser(userId);
  const sessions = useSessionsForUser(userId);

  const sessionMap = new Map(sessions.map((s) => [s.id, s]));

  return (
    <View style={styles.container}>
      <AppBar subtitle="Pengajuan Izin" />

      <Screen scroll={false} edges={['left', 'right']}>
        <View style={styles.screenInner}>
          <FlatList
            data={izinList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              const session = sessionMap.get(item.sessionId);
              return (
                <IzinRow
                  izin={item}
                  praktikum={session?.praktikum}
                  topik={session?.topik}
                  onPress={() =>
                    router.push({
                      pathname: '/praktikan/izin/[id]',
                      params: { id: item.id },
                    })
                  }
                />
              );
            }}
            ItemSeparatorComponent={ListSeparator}
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <View style={styles.headerBlock}>
                <View style={styles.infoCard}>
                  <Text style={styles.infoTitle}>Informasi Izin</Text>
                  <Text style={styles.infoBody}>
                    Pengajuan izin ketidakhadiran dianalisis terlebih dahulu oleh model AI kampus, lalu diverifikasi secara resmi oleh Asisten Laboratorium.
                  </Text>
                </View>

                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionTitle}>Riwayat Pengajuan</Text>
                  <Text style={styles.countText}>{izinList.length} pengajuan</Text>
                </View>
              </View>
            }
            ListEmptyComponent={
              <EmptyState
                title="Belum ada pengajuan izin"
                message="Kamu belum pernah mengajukan izin. Untuk mengajukan, buka sesi praktikum di tab Jadwal lalu pilih Ajukan Izin."
                action={{
                  label: 'Lihat Jadwal',
                  onPress: () => router.push('/praktikan/jadwal'),
                }}
              />
            }
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
  screenInner: {
    flex: 1,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
    gap: spacing.sm,
  },
  headerBlock: {
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  infoCard: {
    backgroundColor: '#E0E8FB',
    borderColor: '#2A4AD0',
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  infoTitle: {
    ...typography.label,
    color: '#1B2F8F',
    fontWeight: '700',
  },
  infoBody: {
    ...typography.caption,
    color: '#1B2F8F',
    lineHeight: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  countText: {
    ...typography.caption,
    color: colors.textMuted,
  },
  separator: {
    height: spacing.sm,
  },
});
