# Presensi Praktikum - Ibrahim (Fase 1 & Fase 2)

Dokumen ini merangkum cara menjalankan dan menguji bagian **Ibrahim Fase 1 dan Fase 2** pada aplikasi Presensi Praktikum. Sumber kebutuhan tetap `docs/SRS.md`.

## Cakupan

Fase 1 Ibrahim mencakup:

- FR-01: memilih peran dan identitas, serta tombol "Ganti peran" di header.
- FR-02: jadwal sesi untuk praktikan, hanya kelasnya sendiri, urut waktu mulai.
- FR-03: detail sesi praktikan.
- FR-07 sampai FR-09: form kode presensi, bottom sheet konfirmasi, umpan balik sukses berisi waktu tercatat, dan penolakan presensi ganda.
- FR-11: riwayat kehadiran beserta ringkasan jumlah.
- README dan penjagaan konsistensi data dummy.

Fase 2 Ibrahim mencakup:

- Uji Skenario Demo SRS bagian 7 pada alur asisten → praktikan → rekap → tutup sesi.
- Pemeriksaan responsif secara statis dan build web.
- Cross review PR Elang (#14) tanpa mengubah file miliknya.
- Perbaikan bug hanya pada file milik Ibrahim.

Di luar cakupan: layar dan komponen asisten (`src/app/asisten/**`, `src/components/**`, `src/features/asisten/**`). Temuan di file Elang diteruskan lewat review, bukan diubah di sini.

## Prasyarat

- Node.js dan npm.
- Dependency proyek sudah terpasang (`npm install`).
- Untuk pengecekan web: browser modern.

## Menjalankan

```bash
npx expo start
```

Untuk memeriksa lewat web:

```bash
npx expo start --web
```

Perintah kualitas yang dipakai:

```bash
npx tsc --noEmit
npx expo export --platform web
```

`npx expo lint` belum dapat dijalankan karena ESLint belum terpasang di proyek. Tidak ada dependency baru yang ditambahkan pada Fase 1.

## Peta route

| Route | File | Fungsi |
| --- | --- | --- |
| `/` | `src/app/index.tsx` | Pilih peran dan identitas |
| `/praktikan/jadwal` | `src/app/praktikan/(tabs)/jadwal.tsx` | Jadwal sesi kelas praktikan |
| `/praktikan/riwayat` | `src/app/praktikan/(tabs)/riwayat.tsx` | Riwayat dan ringkasan kehadiran |
| `/praktikan/sesi/[id]` | `src/app/praktikan/sesi/[id].tsx` | Detail sesi dan alur presensi |
| `/asisten` | `src/app/asisten/index.tsx` | Milik Elang, tidak diubah |

Layout praktikan dilindungi: jika peran atau identitas tidak sesuai, pengguna diarahkan kembali ke `/`.

## Alur demo praktikan

Data dummy sudah menyediakan sesi dengan status yang berbeda. Untuk mencoba presensi berhasil tanpa membuat sesi baru:

1. Jalankan aplikasi dan pilih **Praktikan**.
2. Pilih **Eka Putri** (Kelas B).
3. Buka sesi **Basis Data, Normalisasi** yang berstatus **Dibuka**.
4. Isi kode sesi **1358**, lalu tekan **Presensi**.
5. Periksa bottom sheet konfirmasi, lalu tekan **Konfirmasi**.
6. Bottom sheet sukses menampilkan waktu presensi tercatat.
7. Setelah ditutup, detail sesi menampilkan status tercatat dan tombol **Sudah presensi** dalam keadaan nonaktif.
8. Buka tab **Riwayat** untuk melihat catatan kehadiran Eka dan ringkasan jumlah sesi.

Untuk menguji penolakan kode salah, ulangi langkah 1 sampai 5 dengan kode yang salah. Pesan **Kode sesi tidak sesuai** muncul di bawah field kode. Untuk menguji sesi tertutup, buka sesi **Pemrograman Mobile, State Management** (Kelas B, Ditutup); form presensi tidak ditampilkan dan status sesi dijelaskan lewat banner.

Praktikan Kelas A dapat dipakai untuk melihat variasi:

- **Bagas Pratama** sudah memiliki riwayat pada sesi **Basis Data, SQL Dasar** yang ditutup.
- Sesi **Basis Data, Desain Schema** berstatus **Dibuka** dengan kode **2468**, jadi Bagas atau Citra bisa langsung mencoba presensi tanpa membuat sesi baru.
- Sesi **Pemrograman Mobile, Pengenalan React Native** masih **Dijadwalkan** (6 Nov 2026), jadi belum bisa dipresensi dan tidak ikut dihitung pada ringkasan riwayat.

## Data dummy

| Pengguna | Peran | Kelas |
| --- | --- | --- |
| Dina | Asisten | - |
| Raka | Asisten | - |
| Bagas Pratama | Praktikan | A |
| Citra Lestari | Praktikan | A |
| Dimas Saputra | Praktikan | A |
| Eka Putri | Praktikan | B |
| Fajar Nugroho | Praktikan | B |
| Gita Maharani | Praktikan | B |

Sesi awal:

| Sesi | Kelas | Status | Kode dummy |
| --- | --- | --- | --- |
| Pemrograman Mobile, Pengenalan React Native | A | Dijadwalkan | 0427 |
| Basis Data, Normalisasi | B | Dibuka | 1358 |
| Basis Data, Desain Schema | A | Dibuka | 2468 |
| Pemrograman Mobile, State Management | B | Ditutup | 2469 |
| Basis Data, SQL Dasar | A | Ditutup | 9876 |

Aturan konsistensi yang dijaga:

- Setiap praktikan hanya melihat sesi kelasnya.
- Kode sesi hanya dipakai oleh alur presensi. Layar praktikan tidak menampilkan kode sebelum pengguna memasukkannya.
- Kehadiran awal hanya mengacu pada sesi yang sudah ditutup, sehingga tidak ada praktikan yang tercatat hadir pada sesi yang masih dibuka.
- Sesi berstatus **Dijadwalkan** tidak ikut dihitung pada ringkasan riwayat (jumlah, persentase, dan `aria-valuemax`), tetapi tetap tampil di jadwal.
- Waktu disimpan sebagai ISO 8601 dan ditampilkan lewat formatter lokal `id-ID`.

Data hanya berada di memori Zustand. Menutup atau me-restart aplikasi mengembalikan semua data ke kondisi dummy awal.

## Struktur Fase 1

```text
src/app/_layout.tsx
src/app/index.tsx
src/app/praktikan/_layout.tsx
src/app/praktikan/(tabs)/_layout.tsx
src/app/praktikan/(tabs)/jadwal.tsx
src/app/praktikan/(tabs)/riwayat.tsx
src/app/praktikan/sesi/[id].tsx
src/features/praktikan/GantiPeranButton.tsx
src/features/praktikan/PresensiForm.tsx
src/features/praktikan/PresensiSheet.tsx
src/features/praktikan/RiwayatItem.tsx
src/features/praktikan/attendMessages.ts
docs/README.md
```

Layar hanya memakai aksi dan hook baca dari `src/store/appStore.ts`. Aturan bisnis presensi tetap berada di store. Komponen bersama dari Elang dipakai lewat props tanpa diubah.

## Hasil Fase 2

Skenario Demo SRS bagian 7 diperiksa pada logika store memakai skrip sementara (dihapus setelah uji). Seluruh 27 pemeriksaan lolos:

- Sesi baru berstatus `scheduled`, kode sesi 4 digit, dan langsung terlihat oleh asisten.
- `openSession` mengisi `openedAt`; transisi ganda ditolak; praktikan kelas lain tidak melihat sesi.
- Presensi menerima kode benar dan mencatat timestamp ISO; kode salah, kelas salah, duplikat, dan sesi tertutup ditolak dengan alasan kontrak.
- Rekap menghitung total kelas, hadir, dan belum hadir (urut nama).
- `closeSession` mengisi `closedAt`; praktikan lain melihat status Ditutup dan tidak bisa presensi.
- Daftar sesi praktikan urut `startAt`.

## Hasil review PR Elang (#14)

- Diff hanya mengubah komentar contoh footer `SessionCard` menjadi "3 dari 6 hadir"; sudah konsisten dengan teks nyata di `SessionListItem` dan `RekapList`.
- Tidak ada temuan blocking dan tidak ada file Elang yang diubah.
- Catatan yang diteruskan ke Elang/PM: klaim `tsc` perlu dijalankan setelah tipe route Expo di-generate. `app.json` sudah diubah ke `"orientation": "default"` agar landscape native bisa diuji ulang.

## Verifikasi

- `npx tsc --noEmit` lolos. `expo-env.d.ts` dan `.expo/types` bersifat generated dan gitignored; jalankan `npx expo start` sekali di clone baru agar tipe route tersedia sebelum typecheck.
- `npx expo export --platform web` berhasil: 11 static route dan bundle web 1.2MB.
- Pemeriksaan responsif statis: `Screen` membatasi konten ke 600 dan memusatkannya, layar pilih identitas memakai `useWindowDimensions` (dua kolom mulai 640), aksi `BottomSheet` bertumpuk di bawah 360, dan tidak ada lebar/tinggi tetap pada container utama.
- Pengecekan UI interaktif di browser dan perangkat Android tidak dijalankan pada sesi ini sesuai instruksi. Langkah uji manualnya tetap ada di bagian Alur demo di atas. Landscape native juga belum diuji ulang setelah `app.json` diubah ke `"orientation": "default"`.
