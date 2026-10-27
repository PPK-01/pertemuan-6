# DESIGN.md — Arah Desain: "Kartu Mahasiswa" (Rawuh)

Dokumen ini merupakan sumber kebenaran (*single source of truth*) untuk desain visual, token tema, dan struktur komponen aplikasi **Rawuh** (Presensi Praktikum dengan kode 4 digit). Semua AI agent dan developer yang menambahkan atau mengubah antarmuka wajib merujuk ke dokumen ini agar tampilan tetap kohesif, konsisten, dan memenuhi standar aksesibilitas WCAG AA.

---

## 1. Filosofi & Karakter Produk
Aplikasi dibangun di atas metafora **Kartu Tanda Mahasiswa & Portal Kampus Modern di HP**.
- **Nama Aplikasi:** **Rawuh**
- **Tagline:** Presensi praktikum dengan kode 4 digit.
- **Karakter Visual:** Resmi tapi ramah, tegas, mudah dikenali, tenang, dan tertib.
- **Hierarki Kedalaman:** **Zero drop-shadow** (tanpa bayangan melayang). Pemisahan bidang murni menggunakan perbedaan *fill tint* lembut dan *border* tipis bersudut membulat.

---

## 2. Palet Warna & Verifikasi Kontras (WCAG AA)

Sistem warna menggunakan Navy Pekat sebagai penanda resmi kampus dan Kuning Aksen sebagai identitas dinamis.

| Token | Nilai Hex | Peruntukan | Rasio Kontras Terverifikasi |
| :--- | :--- | :--- | :--- |
| `background` | `#F4F6FB` | Latar belakang aplikasi terang & tenang | — |
| `surface` | `#FFFFFF` | Permukaan kartu, panel kode, bottom sheet | — |
| `text` | `#0E1633` | Teks utama tinta gelap pekat (bukan hitam murni) | **16.44:1** thd background, **17.78:1** thd surface |
| `textMuted` | `#4B5675` | Teks sekunder, label pendukung, placeholder | **6.73:1** thd background, **7.27:1** thd surface |
| `border` | `#D5DAE8` | Garis tepi komponen & divider pemisah | — |
| `borderStrong` | `#7A84A0` | Garis tepi input field & radio sebelum aktif | **3.45:1** thd background (Lolos $\ge 3:1$) |
| `primary` | `#00144A` | Navy pekat untuk AppBar, IdentityCard, tombol utama | **17.52:1** thd `onPrimary` |
| `onPrimary` | `#FFFFFF` | Teks dan ikon di atas permukaan navy | — |
| `accent` | `#FFC400` | Kuning aksen kampus | **10.97:1** thd navy `primary` |
| `onAccent` | `#00144A` | Teks navy di atas kuning aksen | **10.97:1** thd `accent` |
| `tile` | `#E3E7F2` | Latar ubin filter belum terpilih | — |
| `overlay` | `rgba(0, 20, 74, 0.5)` | Backdrop modal BottomSheet | — |
| `disabled.bg` | `#E3E7F2` | Latar kontrol dinonaktifkan | — |
| `disabled.text` | `#66708C` | Teks kontrol dinonaktifkan | **3.98:1** thd `disabled.bg` |
| `status.scheduled` | `{ bg: '#FFF1C2', text: '#5E3B00' }` | Sesi Dijadwalkan (titik kosong) | **8.86:1** thd bg |
| `status.open` | `{ bg: '#DDF1E4', text: '#14603A' }` | Sesi Dibuka (titik penuh) | **6.43:1** thd bg |
| `status.closed` | `{ bg: '#E3E7F2', text: '#3A4560' }` | Sesi Ditutup (kotak) | **7.72:1** thd bg |
| `feedback.danger` | `{ bg: '#FBE3E1', text: '#A32119' }` | Banner kesalahan / gagal presensi | **6.16:1** thd bg |
| `feedback.info` | `{ bg: '#E0E8FB', text: '#1B2F8F' }` | Banner informasi umum | **9.25:1** thd bg |

### Aturan Keras Kuning Aksen (`#FFC400`)
- **BOLEH**: Digunakan di atas warna navy `#00144A` (sebagai ikon, teks kunci peran/kelas, atau tepi sel aktif pada panel navy), atau sebagai latar belakang dengan teks bertinta navy pekat `#00144A`.
- **DILARANG**: Digunakan sebagai teks, ikon, atau garis tepi di atas latar belakang putih (`#FFFFFF`) atau latar abu terang (`#F4F6FB`) karena kontrasnya tidak memenuhi standar WCAG.

---

## 3. Tipografi & Skala Teks

Menggunakan font sistem bawaan platform (*system font*) untuk menjamin performa tinggi dan rendering native yang tajam:
- `display`: `fontSize: 34`, `lineHeight: 40`, `fontWeight: '700'`
- `title`: `fontSize: 24`, `lineHeight: 30`, `fontWeight: '700'`
- `heading`: `fontSize: 18`, `lineHeight: 24`, `fontWeight: '600'`
- `body`: `fontSize: 16`, `lineHeight: 24`, `fontWeight: '400'`
- `label`: `fontSize: 14`, `lineHeight: 20`, `fontWeight: '600'`
- `caption`: `fontSize: 12`, `lineHeight: 16`, `fontWeight: '400'`
- `code`: `fontSize: 48-56`, `fontWeight: '700'`, `fontVariant: ['tabular-nums']`

> **Aturan Tabular:** Semua angka waktu, durasi, jumlah praktikan, dan digit kode sesi wajib menggunakan `fontVariant: ['tabular-nums']` agar karakter tidak bergeser saat nilainya berubah.

---

## 4. Spasial & Sudut (*Border Radius*)

- `spacing`: `xs: 4`, `sm: 8`, `md: 12`, `lg: 16`, `xl: 24`, `xxl: 32`
- `radius`:
  - `sm: 6` (elemen kecil/detail)
  - `md: 10` (tombol, input text, card, banner, sel kode)
  - `lg: 16` (sudut atas bottom sheet modal)
  - `tile: 16` (ubin persegi membulat filter status)
  - `identity: 24` (kartu identitas mahasiswa/asisten)
  - `full: 999` (avatar inisial, badge status, chip, tombol bulat tengah)
- **Target Sentuh Minimum:** Semua elemen interaktif (tombol, baris, tab, input) wajib memiliki area sentuh $\ge 44\text{dp} \times 44\text{dp}$ (`layout.minTouch`).
- **Responsif Tablet:** Lebar konten pada tablet dibatasi maksimal $600\text{dp}$ terpusat (`layout.maxContentWidth`).

---

## 5. Komponen Utama & Pola Antarmuka

### A. `AppBar`
- Latar navy pekat (`#00144A`) yang menyatu dengan status bar atas (`paddingTop: insets.top`).
- Judul tengah: Nama aplikasi **"Rawuh"** (bold putih 16sp) dengan nama layar di bawahnya (regular putih 12sp).
- Tombol kembali (chevron putih) otomatis muncul jika layar berada di dalam stack navigasi.
- Status bar perangkat diatur ke mode `<StatusBar style="light" />`.

### B. `IdentityCard`
- Kartu identitas bersudut membulat besar (`radius.identity: 24`) berlatar navy.
- Memuat:
  1. Avatar lingkaran inisial nama dengan border aksen kuning.
  2. Nama pengguna (bold putih).
  3. Baris kunci kuning `#FFC400` ("Kelas A" atau "Asisten Lab").
  4. Baris pendukung putih ("Praktikan" atau "Laboratorium Komputer").
  5. Tombol outline putih "Ganti peran".

### C. Motif 4 Sel Kode (`CodeCells` & `CodeInput`)
- Motif tanda tangan 4 sel kotak terpisah:
  - **Login:** 4 sel kosong dengan sel pertama beraksen kuning.
  - **Detail Asisten (Dibuka):** Panel navy besar berisi 4 sel putih dengan digit navy besar ($48\text{sp}$ tabular, nol di depan terjaga).
  - **Input Praktikan:** 4 sel putih interaktif dengan fokus bergaris border navy 2dp, digerakkan oleh satu `TextInput` tersembunyi ber-`inputMode="numeric"`.

### D. Navigasi Bawah dengan Tombol Tengah Sadar-Konteks
- **Asisten:** Bar bawah berlatar terang dengan satu tombol bulat besar navy di tengah yang menonjol ke atas (`marginTop: -24`), ikon plus kuning di dalamnya, dan label "Buat sesi" di bawahnya.
- **Praktikan:** Bar bawah 3 pilar: Tab "Jadwal" (kiri), tombol bulat tengah "Isi kode" (tengah), Tab "Riwayat" (kanan). Tombol tengah "Isi kode" sadar-konteks: langsung membuka detail sesi kelas yang sedang dibuka, atau memunculkan bottom sheet info jika belum ada sesi yang dibuka.

### E. Baris Sesi (`SessionRow`)
- Menampilkan data sesi sebagai kartu baris berpemisah bersih dan seragam.
- Memuat: Mata praktikum, badge status, topik, kelas & ruang, waktu berformat tabular, serta teks status bawah opsional ("Sudah presensi" / "x dari y hadir").
- Dilarang membungkus baris sesi ke dalam kontainer berbingkai ganda yang mempersempit lebar kartu.

### F. StatusBadge
- Selalu memadukan **teks label + bentuk geometris**:
  - **Dibuka:** Lingkaran penuh (titik solid) + teks hijau.
  - **Dijadwalkan:** Lingkaran kosong (garis tepi) + teks amber.
  - **Ditutup:** Kotak persegi + teks slate.

---

## 6. Aturan Larangan (*Anti-Slop Guidelines*)
1. DILARANG menggunakan gradien warna-warni generik (*generic AI gradient*).
2. DILARANG menggunakan efek bayangan (*drop-shadow* / *boxShadow* / *elevation*).
3. DILARANG menggunakan ALL-CAPS pada judul, nama, atau label tombol. Gunakan Sentence Case atau Title Case yang rapi.
4. DILARANG menggunakan emoji pada antarmuka, judul, tombol, banner, atau pesan error.
5. DILARANG menggunakan warna kuning di atas latar putih atau abu terang.
6. DILARANG menggunakan animasi memantul (*bounce effect*). Gunakan transisi lembut $\le 200\text{ms}$.

---

## 7. Catatan Kompatibilitas Expo SDK 57 & 58
- Seluruh komponen dirancang menggunakan primitif React Native dan Expo Router standar.
- Navigasi tab bar kustom menggunakan `router.push()` dan `useAppStore` sehingga kompatibel 100% di Expo SDK 57 tanpa perlu pembaruan dependensi `package.json`.
