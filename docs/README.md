# Presensi Praktikum - Fase 1 Ibrahim

Dokumen ini merangkup cara menjalankan dan menguji bagian **Ibrahim Fase 1** pada aplikasi Presensi Praktikum. Sumber kebutuhan tetap `docs/SRS.md`.

## Cakupan

Fase 1 Ibrahim mencakup:

- FR-01: memilih peran dan identitas, serta tombol "Ganti peran" di header.
- FR-02: jadwal sesi untuk praktikan, hanya kelasnya sendiri, urut waktu mulai.
- FR-03: detail sesi praktikan.
- FR-07 sampai FR-09: form kode presensi, bottom sheet konfirmasi, umpan balik sukses berisi waktu tercatat, dan penolakan presensi ganda.
- FR-11: riwayat kehadiran beserta ringkasan jumlah.
- README dan penjagaan konsistensi data dummy.

Di luar cakupan: seluruh layar asisten dan Fase 2. File milik Elang di `src/app/asisten/**`, `src/components/**`, dan `src/features/asisten/**` tidak diubah.

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
- Sesi **Pemrograman Mobile, Pengenalan React Native** masih **Dijadwalkan**, jadi belum bisa dipresensi.
- Untuk mencoba presensi Kelas A, buat dan buka sesi Kelas A lebih dulu dari sisi asisten (alur Elang), lalu masuk kembali sebagai Bagas atau Citra.

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
| Pemrograman Mobile, State Management | B | Ditutup | 2469 |
| Basis Data, SQL Dasar | A | Ditutup | 9876 |

Aturan konsistensi yang dijaga:

- Setiap praktikan hanya melihat sesi kelasnya.
- Kode sesi hanya dipakai oleh alur presensi. Layar praktikan tidak menampilkan kode sebelum pengguna memasukkannya.
- Kehadiran awal hanya mengacu pada sesi yang sudah ditutup, sehingga tidak ada praktikan yang tercatat hadir pada sesi yang masih dibuka.
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

## Verifikasi

- `npx tsc --noEmit` lolos tanpa error.
- `npx expo export --platform web` berhasil menghasilkan bundle dan route layar praktikan, termasuk route dinamis detail sesi.
- Pengecekan browser tidak dijalankan pada sesi ini sesuai instruksi.
