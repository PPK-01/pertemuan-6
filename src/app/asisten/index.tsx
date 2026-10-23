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

type SheetScenario = 'standar' | 'panjang' | 'label' | 'satu' | 'hitung';

const SHEET_SCENARIOS: { id: SheetScenario; label: string }[] = [
  { id: 'standar', label: 'Sheet standar' },
  { id: 'panjang', label: 'Sheet isi panjang' },
  { id: 'label', label: 'Sheet label panjang' },
  { id: 'satu', label: 'Sheet satu aksi' },
  { id: 'hitung', label: 'Sheet penghitung tekan' },
];

// Cukup panjang untuk melewati tinggi layar di landscape, supaya isi sheet harus di-scroll.
const LONG_PARAGRAPHS = [
  'Presensi hanya bisa dilakukan selama sesi berstatus Dibuka. Setelah asisten menutup sesi, kode tidak berlaku lagi.',
  'Kode sesi terdiri dari 4 digit dan dibagikan asisten di kelas. Nol di depan tetap dihitung, jadi 0427 berbeda dengan 427.',
  'Setiap praktikan hanya bisa presensi satu kali per sesi. Percobaan kedua ditolak dengan pesan yang menjelaskan alasannya.',
  'Waktu hadir dicatat saat konfirmasi ditekan, bukan saat kode diketik. Pastikan kode sudah benar sebelum konfirmasi.',
  'Sesi hanya terlihat oleh praktikan di kelas yang sama. Bila sesi tidak muncul, cek kembali kelas pada identitasmu.',
  'Rekap kehadiran di sisi asisten ter-update otomatis begitu presensi tercatat, tanpa perlu memuat ulang layar.',
];

function noop() {}

export default function ComponentPlayground() {
  const [lastPressed, setLastPressed] = useState('-');
  const [name, setName] = useState('');
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [sheetVisible, setSheetVisible] = useState(false);
  const [openScenario, setOpenScenario] = useState<SheetScenario | null>(null);
  const [actionCount, setActionCount] = useState(0);
  const [form, setForm] = useState({ topik: '', ruang: '', tanggal: '', jam: '' });
  const [formNote, setFormNote] = useState('Belum disimpan');

  const closeSheet = () => setSheetVisible(false);
  const closeScenario = () => setOpenScenario(null);
  const cancelAction = { label: 'Batal', onPress: closeScenario };
  const updateForm = (key: keyof typeof form) => (text: string) =>
    setForm((prev) => ({ ...prev, [key]: text }));

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

        <Section title="Skenario BottomSheet">
          <Text style={styles.note}>Aksi terpicu: {actionCount} kali</Text>
          {SHEET_SCENARIOS.map((scenario) => (
            <Button
              key={scenario.id}
              label={scenario.label}
              variant="secondary"
              onPress={() => setOpenScenario(scenario.id)}
            />
          ))}
        </Section>

        {/* Sengaja paling bawah: field terakhir dan tombol Simpan yang paling mudah tertutup keyboard. */}
        <Section title="Form keyboard">
          <Text style={styles.note}>Status: {formNote}</Text>
          <TextField
            label="Topik"
            value={form.topik}
            onChangeText={updateForm('topik')}
            placeholder="mis. Navigasi Expo Router"
          />
          <TextField
            label="Ruang"
            value={form.ruang}
            onChangeText={updateForm('ruang')}
            placeholder="mis. Lab 1"
          />
          <TextField
            label="Tanggal"
            value={form.tanggal}
            onChangeText={updateForm('tanggal')}
            placeholder="DD/MM/YYYY"
            keyboardType="number-pad"
          />
          <TextField
            label="Jam mulai"
            value={form.jam}
            onChangeText={updateForm('jam')}
            placeholder="HH.MM"
            keyboardType="number-pad"
          />
          <Button label="Simpan" onPress={() => setFormNote(`Disimpan: ${form.topik || '(kosong)'}`)} />
        </Section>
      </View>

      <BottomSheet
        visible={openScenario === 'standar'}
        onClose={closeScenario}
        title="Buka sesi ini?"
        primaryAction={{ label: 'Buka sesi', onPress: closeScenario }}
        secondaryAction={cancelAction}
      >
        <Text style={styles.body}>Praktikan bisa presensi setelah sesi dibuka.</Text>
      </BottomSheet>

      <BottomSheet
        visible={openScenario === 'panjang'}
        onClose={closeScenario}
        title="Aturan presensi"
        primaryAction={{ label: 'Mengerti', onPress: closeScenario }}
        secondaryAction={cancelAction}
      >
        {LONG_PARAGRAPHS.map((paragraph) => (
          <Text key={paragraph} style={styles.body}>
            {paragraph}
          </Text>
        ))}
      </BottomSheet>

      {/* Untuk kalibrasi STACK_ACTIONS_BELOW: label sengaja lebih panjang dari label alur SRS. */}
      <BottomSheet
        visible={openScenario === 'label'}
        onClose={closeScenario}
        title="Konfirmasi presensi"
        primaryAction={{ label: 'Konfirmasi presensi sekarang', onPress: closeScenario }}
        secondaryAction={{ label: 'Kembali ke detail sesi', onPress: closeScenario }}
      >
        <Text style={styles.body}>Kode 0427 untuk Pemrograman Mobile, kelas B.</Text>
      </BottomSheet>

      <BottomSheet
        visible={openScenario === 'satu'}
        onClose={closeScenario}
        title="Presensi tercatat"
        primaryAction={{ label: 'Selesai', onPress: closeScenario }}
      >
        <Text style={styles.body}>Waktu hadir 09.12.</Text>
      </BottomSheet>

      <BottomSheet
        visible={openScenario === 'hitung'}
        onClose={closeScenario}
        title="Tutup sesi ini?"
        primaryAction={{
          label: 'Tutup sesi',
          onPress: () => {
            setActionCount((n) => n + 1);
            closeScenario();
          },
        }}
        secondaryAction={cancelAction}
      >
        <Text style={styles.body}>
          Tekan Tutup sesi berkali-kali dengan cepat. Penghitung harus naik tepat 1.
        </Text>
      </BottomSheet>

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
