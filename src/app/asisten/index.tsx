// SEMENTARA: playground komponen untuk Fase 0. File ini diganti layar daftar sesi asisten di Tahap 3.
import { useState } from 'react';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SessionCard } from '@/components/session/SessionCard';
import { SessionInfo } from '@/components/session/SessionInfo';
import { STATUS_LABEL } from '@/components/session/statusLabel';
import { StatusBadge } from '@/components/session/StatusBadge';
import { Banner } from '@/components/ui/Banner';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import type { ButtonProps } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { KELAS_LIST, PRAKTIKUM_LIST, SESSION_STATUS_LIST } from '@/types';
import type { Session, SessionStatus } from '@/types';

const fixtureSessions: Session[] = [
  {
    id: 'fx-scheduled',
    praktikum: PRAKTIKUM_LIST[1],
    kelas: KELAS_LIST[0],
    topik: 'Normalisasi',
    ruang: 'Lab 2',
    startAt: '2026-10-23T02:00:00.000Z',
    endAt: '2026-10-23T04:00:00.000Z',
    status: 'scheduled',
    code: '0427',
    createdBy: 'u-playground',
  },
  {
    id: 'fx-open',
    // Nama praktikum terpanjang yang valid menurut tipe Praktikum, dipadukan dengan footer.
    praktikum: PRAKTIKUM_LIST[0],
    kelas: KELAS_LIST[1],
    topik: 'Pengenalan React Native',
    ruang: 'Lab 1',
    startAt: '2026-10-22T02:00:00.000Z',
    endAt: '2026-10-22T04:00:00.000Z',
    status: 'open',
    code: '1358',
    createdBy: 'u-playground',
    openedAt: '2026-10-22T02:05:00.000Z',
  },
  {
    id: 'fx-closed',
    praktikum: PRAKTIKUM_LIST[0],
    kelas: KELAS_LIST[1],
    topik: 'State Management',
    ruang: 'Lab 1',
    startAt: '2026-10-21T02:00:00.000Z',
    endAt: '2026-10-21T04:00:00.000Z',
    status: 'closed',
    code: '2469',
    createdBy: 'u-playground',
    openedAt: '2026-10-21T02:00:00.000Z',
    closedAt: '2026-10-21T04:00:00.000Z',
  },
];

const BUTTON_VARIANTS: NonNullable<ButtonProps['variant']>[] = ['primary', 'secondary', 'danger', 'ghost'];

type StatusFilter = SessionStatus | 'all';
const FILTERS: StatusFilter[] = ['all', ...SESSION_STATUS_LIST];

function noop() {}

export default function ComponentPlayground() {
  const [lastPressed, setLastPressed] = useState('-');
  const [name, setName] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sheetVisible, setSheetVisible] = useState(false);

  const closeSheet = () => setSheetVisible(false);

  return (
    <Screen>
      <View style={styles.page}>
        <Text style={styles.pageTitle}>Playground komponen</Text>
        <Text style={styles.note}>Terakhir ditekan: {lastPressed}</Text>

        <Section title="Button">
          {BUTTON_VARIANTS.map((variant) => (
            <View key={variant} style={styles.row}>
              <Button label={variant} variant={variant} onPress={() => setLastPressed(variant)} />
              <Button label="Memuat" variant={variant} loading onPress={noop} />
              <Button label="Nonaktif" variant={variant} disabled onPress={noop} />
            </View>
          ))}
        </Section>

        <Section title="TextField">
          <Text style={styles.note}>
            Ketuk field untuk melihat state fokus. Field Topik menunjukkan error saat fokus.
          </Text>
          <TextField
            label="Nama"
            value={name}
            onChangeText={setName}
            placeholder="Ketik nama"
            autoCapitalize="words"
          />
          <TextField
            label="Kode sesi"
            value=""
            onChangeText={noop}
            placeholder="0000"
            hint="4 digit angka"
            keyboardType="number-pad"
            maxLength={4}
          />
          <TextField
            label="Topik"
            value=""
            onChangeText={noop}
            hint="Hint ini tertimpa error"
            error="Topik wajib diisi"
          />
        </Section>

        <Section title="Chip">
          <View role="radiogroup" style={styles.row}>
            {FILTERS.map((item) => (
              <Chip
                key={item}
                label={item === 'all' ? 'Semua' : STATUS_LABEL[item]}
                selected={filter === item}
                onPress={() => setFilter(item)}
              />
            ))}
          </View>
        </Section>

        <Section title="Card">
          <Card>
            <Text style={styles.body}>Card biasa, tidak bisa ditekan.</Text>
          </Card>
          <Card onPress={() => setLastPressed('Card')} accessibilityLabel="Card yang bisa ditekan">
            <Text style={styles.body}>Card yang bisa ditekan.</Text>
          </Card>
        </Section>

        <Section title="EmptyState">
          <EmptyState
            title="Belum ada sesi"
            message="Sesi yang dibuat akan muncul di sini."
            action={{ label: 'Buat sesi', onPress: () => setLastPressed('EmptyState') }}
          />
          <EmptyState title="Tidak ada sesi dibuka" />
        </Section>

        <Section title="Banner">
          <Banner tone="success" title="Presensi tercatat" message="Waktu hadir 09.12." />
          <Banner tone="danger" message="Kode sesi tidak sesuai" />
          <Banner tone="info" message="Sesi dibuka sampai asisten menutupnya." />
        </Section>

        <Section title="BottomSheet">
          <Button label="Buka bottom sheet" onPress={() => setSheetVisible(true)} />
        </Section>

        <Section title="StatusBadge">
          <View style={styles.row}>
            {SESSION_STATUS_LIST.map((status) => (
              <StatusBadge key={status} status={status} />
            ))}
          </View>
        </Section>

        <Section title="SessionInfo">
          <Card>
            <SessionInfo session={fixtureSessions[1]} />
          </Card>
        </Section>

        <Section title="SessionCard">
          {fixtureSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              onPress={() => setLastPressed(`SessionCard ${session.id}`)}
              footer={
                session.status === 'open' ? <Text style={styles.note}>3/6 hadir</Text> : undefined
              }
            />
          ))}
        </Section>
      </View>

      <BottomSheet
        visible={sheetVisible}
        onClose={closeSheet}
        title="Buka sesi ini?"
        primaryAction={{
          label: 'Buka sesi',
          onPress: () => {
            setLastPressed('BottomSheet: Buka sesi');
            closeSheet();
          },
        }}
        secondaryAction={{ label: 'Batal', onPress: closeSheet }}
      >
        <Text style={styles.body}>Praktikan bisa presensi setelah sesi dibuka.</Text>
      </BottomSheet>
    </Screen>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { gap: spacing.xl },
  pageTitle: { ...typography.title, color: colors.text },
  section: { gap: spacing.md },
  sectionTitle: { ...typography.heading, color: colors.text },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  body: { ...typography.body, color: colors.text },
  note: { ...typography.label, color: colors.textMuted },
});
