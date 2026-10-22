# SRS & Rencana Kerja: Aplikasi Presensi Praktikum (React Native)

PM: Dhimas · Tim: Ibrahim, Elang · Sprint: 1 · Versi 1.2

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini mendefinisikan kebutuhan perangkat lunak (SRS) aplikasi mobile React Native untuk mendemokan pencatatan kehadiran praktikum dari dua sudut pandang: **Asisten** dan **Praktikan**. Dokumen ini juga membagi file dan tugas agar dua developer dapat bekerja paralel **tanpa merge conflict**.

### 1.2 Ruang Lingkup

Aplikasi frontend-only tanpa database. Semua data (pengguna, jadwal, sesi, presensi) berupa data dummy lokal yang dikelola oleh state aplikasi. Data hilang saat aplikasi di-restart, dan ini diterima untuk demo sprint ini.

### 1.3 Keputusan Teknis

- **Expo SDK 57 (React Native) + TypeScript**, navigasi **Expo Router** (file-based routing di folder `src/app/`, mengikuti template default Expo; satu file = satu layar, sehingga mudah dipisah kepemilikannya).
- **State: Zustand** (satu store; aksi, selector, dan hook baca terpusat).
- **Styling: `StyleSheet` + Flexbox**, tanpa library UI besar. Bottom sheet dibuat sendiri memakai `Modal` + `Animated` agar tidak bergantung pada native module tambahan.
- **Tema: light mode saja** untuk sprint ini.
- **Mode jalan: development build** di perangkat Android (bukan Expo Go). Pengecekan tampilan tetap bisa lewat `expo start --web`.
- Semua dependency dipasang sekali di Fase 0 oleh Ibrahim. Tidak ada yang mengubah `package.json` setelahnya kecuali lewat PR khusus.

## 2. Aktor dan Data Dummy

| Aktor | Deskripsi | Dummy awal |
| --- | --- | --- |
| Asisten | Mengelola sesi: membuat, membuka, memantau, menutup | 2 asisten (mis. Dina, Raka) |
| Praktikan | Melihat jadwal, presensi, melihat riwayat sendiri | 6 praktikan, tersebar di 2 kelas (mis. A dan B) |

Praktikum dummy: minimal 2 (mis. Pemrograman Mobile, Basis Data). Sesi awal dummy: campuran status Dijadwalkan, Dibuka, dan Ditutup supaya UI langsung terlihat bervariasi.

## 3. Model Data (kontrak; versi awal ditulis Elang, setelah di-merge dimiliki Ibrahim)

```
KELAS_LIST          = ['A', 'B'] as const                           -> Kelas
PRAKTIKUM_LIST      = ['Pemrograman Mobile', 'Basis Data'] as const -> Praktikum
SESSION_STATUS_LIST = ['scheduled', 'open', 'closed'] as const      -> SessionStatus
                      // urutan dipakai chip filter
Role = 'praktikan' | 'asisten'

User { id, name, role, kelas?: Kelas }        // kelas hanya untuk praktikan
Session { id, praktikum: Praktikum, kelas: Kelas, topik, ruang,
          startAt (ISO), endAt (ISO), status: SessionStatus,
          code: string,                       // 4 digit, nol di depan terjaga (mis. '0427')
          createdBy: userId, openedAt?, closedAt? }
Attendance { id, sessionId, userId, timestamp (ISO) }

AttendFailReason = 'SESSION_NOT_OPEN' | 'ALREADY_ATTENDED' | 'INVALID_CODE' | 'NOT_IN_CLASS'
AttendResult =
  | { ok: true, attendance: Attendance }
  | { ok: false, reason: AttendFailReason }

CreateSessionInput = Pick<Session, praktikum | kelas | topik | ruang | startAt | endAt | createdBy>
                                              // id, status, code, openedAt, closedAt dibuat store

Rekap {
  total: number                               // jumlah praktikan di kelas sesi
  hadir: { user: User, timestamp }[]          // urut waktu, paling awal di atas
  belumHadir: User[]                          // urut nama (alfabetis)
}
```

Semua waktu disimpan sebagai ISO 8601 hasil `toISOString()` (UTC) dan ditampilkan dalam waktu lokal lewat `src/utils/time.ts` (`formatDate`, `formatTime`, `formatDateTime`; locale `id-ID`, 24 jam). Parsing dan validasi teks tanggal/jam dilakukan form asisten (`SessionForm` di `src/features/asisten/`). `code` dibuat store saat `createSession` lewat `createSessionCode()` di `src/utils/id.ts`; UI asisten hanya menampilkannya saat status `'open'`.

### Kontrak store (`src/store/appStore.ts`)

```
State : role: Role | null, currentUserId: string | null,
        users: User[], sessions: Session[], attendances: Attendance[]
Aksi  : setRole(role), setCurrentUser(id), resetIdentity()
        createSession(input: CreateSessionInput) -> Session  // status awal 'scheduled'; id & code dibuat store
        openSession(id)  -> boolean                // scheduled -> open, mengisi openedAt
        closeSession(id) -> boolean                // open -> closed, mengisi closedAt
        submitAttendance(sessionId, userId, code) -> AttendResult
Selector (factory: selectX(arg) -> (state) => hasil):
          selectSessionsForUser(userId) -> Session[]
          selectSessionById(id) -> Session | null
          selectAttendanceBySession(sessionId) -> Attendance[]
          selectAttendanceByUser(userId) -> Attendance[]
          hasAttended(sessionId, userId) -> boolean
Hook baca (dipakai layar):
          useSessionsForUser(userId) -> Session[]  // urut startAt
          useSessionById(id) -> Session | null
          useAttendanceBySession(sessionId) -> Attendance[]
          useAttendanceByUser(userId) -> Attendance[]
          useHasAttended(sessionId, userId) -> boolean
          useRekap(sessionId) -> Rekap | null      // null bila sesi tidak ditemukan
Fungsi murni: computeRekap(session, users, attendances) -> Rekap
```

Aturan bisnis hanya boleh ada di store (bukan di layar), sehingga kedua peran selalu konsisten.

Layar membaca data turunan **hanya lewat hook baca**. Alasannya, selector yang mengembalikan array/objek baru setiap dipanggil memicu infinite re-render di Zustand v5. Hook menyembunyikan penanganannya: `useShallow` untuk hasil filter, `useMemo` untuk data yang dibentuk ulang seperti rekap (`useRekap` memanggil `computeRekap`). State primitif (`role`, `currentUserId`) dan aksi boleh diambil langsung via `useAppStore(s => s.x)`.

### Kontrak theme (`src/theme/`; versi awal ditulis Elang, setelah di-merge dimiliki Ibrahim)

```
colors.ts     : type ColorPair = { bg, text }
                primary, onPrimary, background, surface, border,
                borderStrong,  // batas TextField & Chip belum terpilih; kontras 3:1
                               // thd background, hitung ulang sebelum mengubah
                text, textMuted, overlay,
                disabled: ColorPair,
                feedback { success, danger, info } -> ColorPair,
                status   { scheduled, open, closed } -> ColorPair
                         // satisfies Record<SessionStatus, ColorPair>
spacing.ts    : mengekspor spacing, radius, layout
                spacing  xs 4 · sm 8 · md 12 · lg 16 · xl 24 · xxl 32
                radius   sm 6 · md 10 · lg 16 · full 999
                layout   minTouch 44 · maxContentWidth 600
typography.ts : display · title · heading · body · label · caption
                (TextStyle lengkap dengan lineHeight, font sistem)
```

Nama token semantik (bukan nama warna) agar dark mode bisa ditambah kelak tanpa mengganti komponen. Tidak ada token shadow; `Card` memakai border. Kontras teks terhadap latar minimal 4.5:1 (NFR-04). Token diimpor per file (`@/theme/colors`, `@/theme/spacing`, `@/theme/typography`) tanpa barrel `index.ts`.

## 4. Kebutuhan Fungsional

| ID | Kebutuhan | Peran |
| --- | --- | --- |
| FR-01 | Pengguna memilih peran (Asisten/Praktikan) lalu identitas dari daftar dummy melalui form pilihan sederhana. Bisa berganti peran/identitas kapan saja dari header. | Keduanya |
| FR-02 | Menampilkan daftar jadwal sesi: nama praktikum, kelas, waktu, status sesi, diurutkan berdasarkan waktu mulai. Praktikan hanya melihat sesi kelasnya sendiri. Asisten melihat semua sesi. | Keduanya |
| FR-03 | Layar detail sesi: praktikum, kelas, topik, ruang, waktu mulai-selesai, status. | Keduanya |
| FR-04 | Asisten membuat sesi baru lewat **form** (praktikum, kelas, topik, ruang, tanggal, jam mulai/selesai). Validasi field wajib. Sesi baru berstatus Dijadwalkan. | Asisten |
| FR-05 | Asisten membuka sesi (Dijadwalkan → Dibuka) dan menutup sesi (Dibuka → Ditutup) lewat **bottom sheet konfirmasi**. Perubahan status langsung tampil di layar asisten maupun praktikan. | Asisten |
| FR-06 | Saat sesi dibuka, asisten melihat **kode sesi** (4 digit) untuk dibagikan di kelas. | Asisten |
| FR-07 | Praktikan melakukan presensi hanya jika sesi berstatus Dibuka: mengisi **form kode sesi**, lalu **bottom sheet konfirmasi**. | Praktikan |
| FR-08 | Setelah presensi berhasil, aplikasi mencatat waktu kehadiran (timestamp) dan menampilkan umpan balik sukses (bottom sheet/banner) berisi waktu tercatat. | Praktikan |
| FR-09 | Praktikan yang sama tidak bisa presensi dua kali pada sesi yang sama. Tombol berubah menjadi "Sudah presensi" dan percobaan ulang ditolak dengan pesan jelas. | Praktikan |
| FR-10 | Rekap sederhana: asisten melihat daftar praktikan yang sudah presensi beserta waktunya (urut waktu, yang paling awal di atas), jumlah hadir dari total praktikan kelas, dan daftar yang belum hadir (urut nama). Rekap ter-update otomatis ketika ada presensi baru. | Asisten |
| FR-11 | Riwayat kehadiran: praktikan melihat catatan kehadiran dirinya sendiri (sesi, kelas, waktu hadir) dan ringkasan jumlah. | Praktikan |
| FR-12 | Alur demo end-to-end konsisten (lihat bagian 7). | Keduanya |

### Kasus penolakan presensi (pesan error di form)

Kode salah → "Kode sesi tidak sesuai". Sesi belum dibuka/sudah ditutup → "Sesi tidak sedang dibuka". Sudah hadir → "Kamu sudah presensi pada sesi ini". Kelas tidak cocok → "Sesi ini bukan untuk kelasmu".

## 5. Kebutuhan Non-Fungsional

- **NFR-01 Responsif:** layout berbasis Flexbox, `useWindowDimensions`, tanpa lebar/tinggi fixed untuk container utama. Benar di layar kecil (≈360dp), besar, dan landscape; pada tablet konten dibatasi lebar maksimum (`layout.maxContentWidth`) dan dipusatkan.
- **NFR-02 State respons:** setiap aksi pengguna punya umpan balik state: loading/disabled saat submit, error inline pada form, empty state pada list kosong, status badge berwarna, tombol nonaktif bila aksi tidak valid.
- **NFR-03 Konsistensi:** satu sumber kebenaran (store). Tidak ada salinan data di state lokal layar kecuali input form dan state tampilan (mis. filter yang sedang dipilih).
- **NFR-04 Keterbacaan:** area sentuh ≥ 44dp (`layout.minTouch`), kontras teks memadai (≥ 4.5:1), label bahasa Indonesia konsisten.
- **NFR-05 Kualitas kode:** TypeScript strict, tanpa `any`, komponen kecil, lolos code review sebelum merge.
- **NFR-06 Platform:** berjalan sebagai development build di Android dan dapat dicek lewat `expo start --web`.

## 6. Navigasi dan Interaksi

```
/                       Pilih peran + identitas (form)             [Ibrahim]
/praktikan  (Stack)
  (tabs)/jadwal         Daftar jadwal kelasnya                      [Ibrahim]
  (tabs)/riwayat        Catatan kehadiran sendiri                   [Ibrahim]
  sesi/[id]             Detail sesi + tombol Presensi               [Ibrahim]
                        -> form kode -> bottom sheet konfirmasi -> sheet sukses
/asisten    (Stack)
  index                 Daftar semua sesi + filter status           [Elang]
  buat                  Form buat sesi                              [Elang]
  sesi/[id]             Detail + Buka/Tutup (bottom sheet) + Rekap  [Elang]
```

Path di atas adalah route; file-nya berada di `src/app/` (mis. `/asisten/buat` → `src/app/asisten/buat.tsx`).

Header di kedua peran memiliki tombol "Ganti peran" untuk kembali ke `/`.

## 7. Skenario Demo (kriteria penerimaan utama)

1. Pilih **Asisten (Dina)** → buat sesi baru lewat form → sesi muncul dengan status *Dijadwalkan*.
2. Buka sesi lewat bottom sheet konfirmasi → status *Dibuka*, kode sesi tampil.
3. Ganti ke **Praktikan** (kelas sesuai) → sesi tampil berstatus *Dibuka* → isi kode → konfirmasi → sukses dengan waktu tercatat.
4. Coba presensi lagi → ditolak (FR-09). Cek tab Riwayat → catatan muncul.
5. Kembali ke **Asisten** → detail sesi → rekap menampilkan praktikan tadi beserta waktunya.
6. Asisten menutup sesi → status *Ditutup*.
7. Praktikan lain mencoba presensi → ditolak, dan status *Ditutup* terlihat di jadwalnya.

## 8. Struktur File dan Kepemilikan (anti merge conflict)

```
src/
  app/
    _layout.tsx                    IBRAHIM   root Stack
    index.tsx                      IBRAHIM   pilih peran & identitas
    praktikan/
      _layout.tsx                  IBRAHIM
      (tabs)/_layout.tsx           IBRAHIM
      (tabs)/jadwal.tsx            IBRAHIM
      (tabs)/riwayat.tsx           IBRAHIM
      sesi/[id].tsx                IBRAHIM
    asisten/
      _layout.tsx                  ELANG
      index.tsx                    ELANG
      buat.tsx                     ELANG
      sesi/[id].tsx                ELANG
  types/index.ts                   IBRAHIM*
  data/dummy.ts                    IBRAHIM
  store/appStore.ts                IBRAHIM
  theme/ (colors, spacing,         IBRAHIM*
          typography)
  utils/ (time.ts, id.ts)          IBRAHIM
  components/ui/                   ELANG     Button, TextField, Card, Chip,
                                             EmptyState, BottomSheet, Banner,
                                             Screen (wrapper responsif),
                                             pressable.ts (PRESSED_OPACITY)
  components/session/              ELANG     SessionCard, StatusBadge, SessionInfo,
                                             statusLabel.ts (STATUS_LABEL),
                                             sessionTime.ts (formatSessionTime)
  features/praktikan/              IBRAHIM   PresensiForm, PresensiSheet, RiwayatItem
  features/asisten/                ELANG     SessionForm, StatusActionSheet, RekapList
  global.css                       -         bawaan template, dibiarkan
docs/                              IBRAHIM   SRS.md, README.md
AGENTS.md                          -         bawaan template, dibiarkan
```

\* Versi awal `types` dan `theme` ditulis Elang di Fase 0. Setelah di-merge, kepemilikan kembali ke Ibrahim dan perubahan berikutnya lewat Ibrahim.

File contoh bawaan template (`src/app/explore.tsx`, isi `src/components/`, `src/constants/`, `src/hooks/`, `scripts/reset-project.js`) dihapus oleh Elang di awal Fase 0. PR pembersihan ini juga menyederhanakan `src/app/_layout.tsx` dan `src/app/index.tsx`, serta menghapus script `reset-project` di `package.json`, atas persetujuan Ibrahim. Setelah itu kedua file layar tersebut menjadi milik Ibrahim.

### Aturan kepemilikan

1. **Satu file = satu pemilik.** Hanya pemilik yang boleh mengedit. Butuh perubahan di file orang lain? Buka issue/PR kecil ke pemiliknya atau minta lewat chat, jangan edit sendiri.
2. **Shared UI lewat props saja.** Komponen di `components/` tidak boleh mengimpor store atau tahu soal peran. Selain `react` dan `react-native`, komponen hanya boleh mengimpor `@/types`, `@/theme/*`, `@/utils/time`, `react-native-safe-area-context`, dan sesama komponen (impor langsung per file). Aksi spesifik peran dimasukkan lewat props (mis. `onPress`, `primaryAction`/`secondaryAction`, `footer`, `children`).
3. **Tidak ada barrel `index.ts` bersama.** Impor langsung dari file komponen supaya tidak ada file yang sering diedit berdua.
4. **Tidak menyentuh `package.json` / lockfile** setelah Fase 0.
5. **Layar hanya memanggil aksi dan hook baca dari store.** Aturan bisnis tidak diduplikasi di layar. Filter tampilan berbasis state UI (mis. chip status di daftar sesi asisten) boleh di layar.

## 9. Pembagian Tugas

### Fase 0: Kontrak (hari pertama, berurutan)

Project Expo sudah diinisialisasi dari repo `pertemuan-6` (template default SDK 57).

| Urutan | Siapa | Tugas | Output (PR ke `main`) |
| --- | --- | --- | --- |
| 1 | Elang | Bersihkan file bawaan template (lihat bagian 8) | Repo bersih |
| 2 | Elang | Tulis `types` (termasuk `Rekap`) dan `theme` versi awal sesuai bagian 3 | Kontrak types & theme |
| 3 | Ibrahim | Pasang dependency (zustand, safe-area-context, dll.), `dummy`, `appStore` (seluruh aksi, selector, hook baca, `computeRekap`/`useRekap` bertanda tangan final), `utils/time.ts` | Kontrak store |
| 4 | Elang | Stub komponen `components/ui` dan `components/session` dengan **props final** (isi sederhana dulu) | Stub komponen siap dipakai |

Langkah 3 dan 4 boleh berjalan bersamaan setelah langkah 2 di-merge. Setelah Fase 0 selesai, keduanya bekerja paralel pada folder masing-masing tanpa saling menunggu.

### Fase 1: Paralel

**Ibrahim (Fondasi + sisi Praktikan)**

- Layar pilih peran/identitas (FR-01) dengan header ganti peran.
- Jadwal praktikan, detail sesi, form kode presensi, bottom sheet konfirmasi dan sukses, penolakan duplikat (FR-02, 03, 07, 08, 09).
- Riwayat kehadiran (FR-11).
- Logika presensi di store (kode, status sesi, kelas, duplikat, timestamp) dan logika rekap (`computeRekap`).
- README + penjagaan konsistensi data dummy.

**Elang (UI Kit + sisi Asisten)**

- Finalisasi komponen UI dan session yang responsif (NFR-01, 02, 04).
- Daftar sesi asisten + filter status (FR-02).
- Form buat sesi dengan validasi (FR-04).
- Detail sesi asisten, bottom sheet konfirmasi buka/tutup, tampilan kode sesi (FR-03, 05, 06).
- Rekap hadir/belum hadir dengan waktu lewat `useRekap` (FR-10).

### Fase 2: Integrasi dan hardening (bersama, hari terakhir)

- Jalankan Skenario Demo (bagian 7) berdua, dua perangkat/emulator atau berganti peran.
- Cek responsif (kecil, besar, landscape, web).
- Cross code review: Ibrahim mereview PR Elang, Elang mereview PR Ibrahim.
- Perbaikan bug dibagi sesuai pemilik file.

## 10. Alur Git

- `main` dilindungi; semua lewat PR dengan 1 review dari rekan.
- Branch: `feat/ibrahim-<topik>` dan `feat/elang-<topik>` (`chore/elang-<topik>` untuk pembersihan template). Commit kecil, PR kecil (maks. satu layar/fitur).
- Commit message berformat **head-body**, tanpa trailer co-author dari AI (`Co-Authored-By`).
- Rebase dari `main` sebelum membuka PR. Karena folder terpisah, konflik seharusnya nol.
- Perubahan kontrak store/types/theme wajib diumumkan ke Elang sebelum merge (pemilik: Ibrahim).

## 11. Definition of Done

- Skenario Demo berjalan penuh tanpa error di Android (development build) dan web.
- Semua FR-01 s.d. FR-12 terpenuhi; NFR-01 s.d. NFR-06 terpenuhi.
- Tidak ada `console.error`, tidak ada `any`, lolos review kode.
- Status sesi selalu konsisten antar peran tanpa refresh manual.

## 12. Prompt untuk AI Agent Harness

Catatan: prompt Ibrahim menginstruksikan agent membaca `SKILL.md` tiap skill terlebih dahulu. Beberapa skill berorientasi web (web-design-guidelines, frontend-design, taste-skill); prompt meminta agent mengadaptasi prinsipnya ke React Native. Prompt Elang memakai 6 skill terpilih yang sudah dipasang global; skill `grilling` di sana dipakai untuk mewawancarai manusia saat ada keputusan desain yang ambigu, dan perintah git dijalankan oleh manusia, bukan agent.

### 12.1 Prompt: Ibrahim

```text
Kamu adalah AI coding agent untuk IBRAHIM di proyek aplikasi mobile React Native (Expo SDK 57 + TypeScript + Expo Router + Zustand) "Presensi Praktikum". Rekanmu Elang dikerjakan agent lain. Sumber kebenaran: docs/SRS.md (jika belum ada, minta SRS dari saya). Bahasa UI: Indonesia. Bahasa komunikasi denganku: Indonesia.

== LANGKAH 0: SIAPKAN SKILL ==
Pasang/aktifkan SEMUA skill berikut, lalu BACA SKILL.md masing-masing sebelum menulis kode. Mulai dengan skill find-skills untuk membantu menemukan dan memasang skill lain bila perintah instalasi gagal:
1. https://www.skills.sh/vercel-labs/skills/find-skills
2. https://www.skills.sh/mattpocock/skills/grill-me
3. https://www.skills.sh/mattpocock/skills/grill-with-docs
4. https://www.skills.sh/vercel-labs/agent-browser/agent-browser
5. https://www.skills.sh/designed-by-ai/skills/design-mobile-apps
6. https://www.skills.sh/mattpocock/skills/codebase-design
7. https://www.skills.sh/mattpocock/skills/code-review
8. https://www.skills.sh/vercel-labs/agent-skills/web-design-guidelines
9. https://github.com/leonxlnx/taste-skill
10. https://www.skills.sh/site/uizze.sh/ui-taste
11. https://www.skills.sh/mattpocock/skills/diagnosing-bugs
12. https://www.skills.sh/leonxlnx/taste-skill/design-taste-frontend
13. https://www.skills.sh/leonxlnx/taste-skill/high-end-visual-design
14. https://www.skills.sh/mattpocock/skills/loop-me
15. https://www.skills.sh/mattpocock/skills/grilling
16. https://www.skills.sh/anthropics/skills/frontend-design
Skill berorientasi web: adaptasikan prinsipnya ke React Native (bukan HTML/CSS).

== PERAN & KEPEMILIKAN FILE ==
Kamu pemilik file berikut, dan HANYA boleh mengedit ini:
- src/app/_layout.tsx, src/app/index.tsx
- src/app/praktikan/** (layout, (tabs)/jadwal, (tabs)/riwayat, sesi/[id])
- src/types/, src/theme/ (versi awal ditulis Elang; setelah di-merge menjadi milikmu)
- src/data/, src/store/, src/utils/
- src/features/praktikan/**
- docs/**, package.json, lockfile (hanya di Fase 0)
JANGAN mengedit: src/app/asisten/**, src/components/**, src/features/asisten/** (milik Elang). Butuh perubahan di sana? Tulis permintaan singkat untuk kusampaikan ke Elang, jangan edit sendiri.

== TUGAS ==
Fase 0 (mulai setelah PR types & theme dari Elang di-merge, push ke main secepatnya):
- Project Expo sudah ada. Pasang semua dependency yang dibutuhkan proyek.
- Tulis dummy data (2 asisten, 6 praktikan di 2 kelas, 2 praktikum, sesi awal bervariasi status), utils waktu, dan appStore dengan kontrak PERSIS seperti di SRS bagian 3 (createSession, openSession, closeSession, submitAttendance + AttendResult, selector, hook baca, computeRekap + useRekap). Aturan bisnis (sesi harus open, kode benar, kelas cocok, tidak boleh duplikat, timestamp ISO, urutan sesi dan rekap) HANYA di store.
- Hook baca wajib aman dari infinite re-render Zustand v5: pakai useShallow untuk hasil filter, useMemo untuk data yang dibentuk ulang (rekap).
- Beri tahu aku saat kontrak store siap.
Fase 1:
- Layar pilih peran + identitas (form pilihan), header "Ganti peran".
- Praktikan: jadwal (hanya kelasnya), detail sesi, form kode presensi, bottom sheet konfirmasi, bottom sheet/banner sukses berisi waktu tercatat, penolakan presensi ganda, riwayat kehadiran + ringkasan.
- Pakai komponen dari src/components/** milik Elang lewat props. Jika stub belum final, pakai komponen sementara di dalam folder fiturmu sendiri; jangan edit milik Elang.
- Layar hanya memakai aksi dan hook baca dari store.
Fase 2: ikut uji skenario demo SRS bagian 7 dan review PR Elang.

== ALUR KERJA WAJIB (pakai skill) ==
1. grill-me / grill-with-docs / grilling: sebelum coding tiap fitur, grilling dirimu terhadap SRS; jawab dari docs dulu, tanyakan ke aku hanya jika ambigu atau bertabrakan dengan SRS.
2. codebase-design: rancang struktur/modul sebelum menulis; jaga kopling rendah (layar hanya memanggil aksi/hook store).
3. design-mobile-apps, design-taste-frontend, high-end-visual-design, ui-taste, taste-skill, frontend-design, web-design-guidelines: terapkan untuk kualitas UI mobile (hierarki visual, spacing, area sentuh >=44dp, kontras, state kosong/loading/error/disabled, tanpa tampilan template generik). Wajib responsif: Flexbox, useWindowDimensions, tanpa ukuran fixed untuk container utama, benar di 360dp, tablet, landscape.
4. agent-browser: jalankan `expo start --web`, verifikasi alur dan tata letak di beberapa ukuran viewport dengan browser, ambil tangkapan layar sebagai bukti.
5. loop-me: ulangi siklus implementasi -> verifikasi -> perbaiki sampai kriteria penerimaan terpenuhi; berhenti saat Skenario Demo lolos.
6. diagnosing-bugs: bila ada bug/error, diagnosis sistematis (reproduksi, hipotesis, bukti) sebelum memperbaiki.
7. code-review: sebelum membuka PR, review diff sendiri; pastikan TypeScript strict, tanpa `any`, tanpa console.error.
8. find-skills: gunakan bila butuh skill tambahan.

== ATURAN GIT ==
Branch feat/ibrahim-<topik>, commit kecil, commit message format head-body tanpa trailer Co-Authored-By, rebase dari main sebelum PR, satu PR = satu fitur/layar. Jangan sentuh file di luar kepemilikanmu. Perubahan kontrak store/types/theme harus kuumumkan ke Elang sebelum merge.

== FORMAT LAPORAN ==
Setiap selesai satu fitur: ringkas apa yang dibuat, file yang diubah (harus dalam kepemilikanmu), hasil verifikasi agent-browser, dan sisa pekerjaan.
```

### 12.2 Prompt: Elang

```text
Kamu adalah AI coding agent untuk ELANG di proyek aplikasi mobile React Native (Expo SDK 57 + TypeScript + Expo Router + Zustand) "Presensi Praktikum". Rekanmu Ibrahim dikerjakan agent lain. Sumber kebenaran: docs/SRS.md (jika belum ada, minta SRS dari saya). Bahasa UI: Indonesia. Bahasa komunikasi denganku: Indonesia.

== LANGKAH 0: SKILL ==
Skill berikut SUDAH terpasang secara global. BACA SKILL.md masing-masing sebelum menulis kode. Jangan memasang skill lain dan jangan menulis file skill ke dalam repo.
1. grilling (mattpocock)
2. codebase-design (mattpocock)
3. frontend-design (anthropics)
4. agent-browser (vercel-labs)
5. diagnosing-bugs (mattpocock)
6. code-review (mattpocock)
frontend-design berorientasi web: terjemahkan prinsipnya ke StyleSheet React Native (bukan HTML/CSS).

== PERAN & KEPEMILIKAN FILE ==
Kamu pemilik file berikut, dan HANYA boleh mengedit ini:
- src/app/asisten/** (layout, index, buat, sesi/[id])
- src/components/ui/** (Button, TextField, Card, Chip, EmptyState, BottomSheet, Banner, Screen)
- src/components/session/** (SessionCard, StatusBadge, SessionInfo)
- src/features/asisten/** (SessionForm, StatusActionSheet, RekapList)
- Khusus Fase 0: file bawaan template yang dibersihkan (lihat SRS bagian 8), serta versi awal src/types/index.ts dan src/theme/ (setelah di-merge menjadi milik Ibrahim).
JANGAN mengedit: src/app/_layout.tsx, src/app/index.tsx, src/app/praktikan/**, src/data, src/store, src/utils, src/features/praktikan, package.json (milik Ibrahim), serta src/types dan src/theme setelah Fase 0. Butuh perubahan di sana? Tulis permintaan singkat untuk kusampaikan ke Ibrahim.
Aturan komponen: components/** TIDAK BOLEH mengimpor store atau tahu soal peran; semua aksi lewat props (actions, onPress, children). Tanpa barrel index.ts; impor langsung per file.

== TUGAS ==
Fase 0 (berurutan, satu PR per langkah):
1. Bersihkan file bawaan template sesuai SRS bagian 8.
2. Tulis src/types/index.ts (termasuk Rekap) dan src/theme/ (colors, spacing, typography) sesuai SRS bagian 3. Light mode saja.
3. Stub komponen ui & session dengan props FINAL. Props yang sudah dibagikan tidak boleh diubah tanpa mengabari Ibrahim.
Fase 1:
- Finalisasi UI kit: responsif, state disabled/loading/error, BottomSheet (Modal + Animated, tanpa native module baru), area sentuh >=44dp, Screen wrapper yang membatasi lebar maksimum di tablet. Gunakan token dari src/theme/, bukan angka/warna lepas.
- Asisten: daftar semua sesi + filter status (Semua/Dijadwalkan/Dibuka/Ditutup) + empty state; form buat sesi dengan validasi field wajib dan state error inline; detail sesi; bottom sheet konfirmasi buka/tutup sesi; tampilan kode sesi saat Dibuka; rekap lewat useRekap: jumlah hadir/total, daftar hadir urut waktu beserta jam, daftar belum hadir; semuanya ter-update otomatis dari store.
- Gunakan HANYA aksi dan hook baca store (createSession, openSession, closeSession, useSessionsForUser, useSessionById, useRekap, dst.). Jangan menyalin data ke state lokal selain input form dan state tampilan (filter status boleh di layar).
Fase 2: ikut uji skenario demo SRS bagian 7 dan review PR Ibrahim.

== ALUR KERJA WAJIB (pakai skill) ==
1. grilling: bila ada keputusan desain yang ambigu dan tidak terjawab SRS, wawancarai AKU secara bertahap sebelum menulis kode. Cek SRS dulu; jangan bertanya hal yang sudah dijawab SRS.
2. codebase-design: rancang API komponen (props) dan struktur modul sebelum menulis; kopling rendah.
3. frontend-design: satu-satunya panduan arah visual untuk UI kit dan layar asisten (hierarki visual, spacing, tipografi, warna status yang jelas, tanpa tampilan template generik). Wajib responsif: Flexbox, useWindowDimensions, benar di 360dp, tablet, landscape.
4. agent-browser: jalankan `npx expo start --web`, verifikasi alur dan tata letak di ±360px, tablet, dan landscape, ambil tangkapan layar sebagai bukti.
5. diagnosing-bugs: diagnosis sistematis (reproduksi, hipotesis, bukti) sebelum memperbaiki bug.
6. code-review: review diff terhadap main sebelum PR; TypeScript strict (`npx tsc --noEmit` lolos), tanpa `any`, tanpa console.error.
Ulangi implementasi -> verifikasi -> perbaiki sampai kriteria penerimaan terpenuhi.

== ATURAN GIT ==
Kamu TIDAK menjalankan perintah git yang mengubah repo (commit, push, merge, rebase, checkout -b, stash, reset, dll.); semuanya aku yang jalankan. Kamu boleh membaca (git status, git diff, git log). Setiap selesai satu unit kerja, sarankan commit message berformat head-body tanpa trailer Co-Authored-By. Branch feat/elang-<topik> (chore/elang-<topik> untuk pembersihan), satu PR = satu fitur/layar. Jangan sentuh file di luar kepemilikanmu.

== FORMAT LAPORAN ==
Setiap selesai satu fitur: ringkas apa yang dibuat, file yang diubah (harus dalam kepemilikanmu), hasil verifikasi agent-browser, saran commit message, dan sisa pekerjaan.
```

## 13. Risiko dan Catatan

| Risiko | Mitigasi |
| --- | --- |
| Elang menunggu kontrak store | Elang mengerjakan pembersihan, types, theme, dan UI kit yang tidak butuh store lebih dulu; layar asisten ditulis mengikuti kontrak SRS dan PR-nya dibuka setelah store di-merge |
| Ibrahim menunggu types & theme | Langkah 1–2 Fase 0 dikerjakan Elang lebih dulu dan singkat |
| Ibrahim menunggu komponen UI | Pakai komponen sementara di folder fitur sendiri; ganti setelah stub Elang di-merge |
| Perubahan kontrak di tengah jalan | Wajib diumumkan; pemilik tunggal (Ibrahim) setelah Fase 0 |
| Kepemilikan sementara types/theme membingungkan | Hanya berlaku sampai PR Fase 0 di-merge; setelah itu semua perubahan lewat Ibrahim |
| Infinite re-render karena selector mengembalikan referensi baru (Zustand v5) | Layar hanya memakai hook baca dari store; rekap lewat `useRekap` (`useMemo` + `computeRekap`) |
| Trailer co-author AI terbawa ke commit | Atribusi di agent dimatikan; commit dibuat dan diperiksa manusia |
| Kode sesi dianggap di luar kebutuhan | Ini keputusan desain agar "form" presensi bermakna; bila tidak diinginkan, ganti dengan form pernyataan hadir tanpa mengubah kontrak lain |
| Data hilang saat restart | Diterima untuk demo; persistensi (mis. AsyncStorage) bisa jadi backlog |

## 14. Riwayat Perubahan

| Versi | Perubahan |
| --- | --- |
| 1.0 | Versi awal dari PM |
| 1.1 | Routing di `src/app/` (template SDK 57); development build menggantikan Expo Go; pembersihan template oleh Elang; versi awal `types` & `theme` ditulis Elang lalu dikembalikan ke Ibrahim; kontrak theme (light mode); tipe `Rekap`, hook baca store, `computeRekap`/`useRekap`; urutan sesi dan rekap; aturan commit tanpa co-author; prompt Elang memakai 6 skill dan git dijalankan manusia |
| 1.2 | Mencatat keputusan Fase 0 yang sudah diterapkan di kode: `KELAS_LIST`/`PRAKTIKUM_LIST`/`SESSION_STATUS_LIST` beserta tipe turunannya; `Session.code` 4 digit; `CreateSessionInput` dan `AttendFailReason`; waktu ISO (UTC) + formatter lokal di `utils/time.ts`; tanda tangan store sesuai kode; theme: `borderStrong`, `ColorPair`, ekspor `spacing.ts`, tanpa barrel; helper komponen (`pressable.ts`, `statusLabel.ts`, `sessionTime.ts`); daftar impor yang diizinkan untuk `components/` |
