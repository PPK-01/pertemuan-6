# Presensi Praktikum

Aplikasi mobile berbasis **React Native (Expo SDK 57)** untuk pencatatan kehadiran sesi praktikum secara interaktif, efisien, dan offline-first (in-memory demo) dengan dua perspektif peran: **Asisten Lab** dan **Praktikan**.

[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK_57-000020?style=for-the-badge&logo=expo&logoColor=white)](https://docs.expo.dev/)
[![React Native 0.86](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict_Typed-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Zustand](https://img.shields.io/badge/State-Zustand_5-443e38?style=for-the-badge)](https://zustand-demo.pmnd.rs/)
[![WCAG AA](https://img.shields.io/badge/Accessibility-WCAG_AA_(4.5%3A1)-166534?style=for-the-badge)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Ringkasan Proyek

Aplikasi ini dikembangkan untuk mendemokan sistem presensi presisi tanpa dependensi database eksternal. Seluruh alur kerja menggunakan state management lokal berbasis Zustand dengan data dummy terstruktur.

> [!NOTE]
> Proyek dirancang dengan pola *parallel development without merge conflicts*—pemisahan ketat kepemilikan file antara tim frontend (UI Kit & Layar Asisten) dan tim backend/logika (Store & Layar Praktikan).

### Fitur Utama

- **Switch Peran Instan (FR-01):** Berganti konteks pengguna antara Asisten dan Praktikan kapan saja tanpa alur autentikasi/login yang memakan waktu demo.
- **Manajemen Sesi Asisten (FR-02 – FR-06, FR-10):**
  - Pembuatan sesi baru dengan validasi form (topik, ruang, jadwal ISO UTC).
  - Pembukaan sesi dengan auto-generated **Kode Token 4-Digit**.
  - Penutupan sesi via modal bottom-sheet konfirmasi.
  - Rekapitulasi kehadiran *real-time* (daftar hadir vs belum hadir, rasio kelas).
- **Alur Presensi Praktikan (FR-07 – FR-09, FR-11):**
  - Filter otomatis: Praktikan hanya melihat jadwal kelasnya sendiri.
  - Presensi berbasis kode 4 digit dengan proteksi status sesi dan validasi duplikasi.
  - Riwayat presensi personal lengkap dengan stempel waktu presisi.

---

## Tech Stack & Dependensi

| Layer | Teknologi | Catatan Teknis |
| :--- | :--- | :--- |
| **Framework** | Expo SDK 57 (React Native 0.86) | Managed workflow, Hermes engine, New Architecture |
| **Routing** | Expo Router (`src/app/`) | File-based routing, native stack navigation |
| **State Management**| Zustand v5 | Single source of truth, shallow selector hooks, decoupled action triggers |
| **Styling & Theme** | Native `StyleSheet` + Token Semantik | Token terstandarisasi di `src/theme/` (colors, spacing, typography) |
| **Animasi** | React Native `Animated` | Custom BottomSheet dengan single-value driver & dukungan *Reduce Motion* |
| **Aksesibilitas** | Safe Area & Accessibility APIs | `react-native-safe-area-context`, `KeyboardAvoidingView`, ARIA roles |
| **Bahasa** | TypeScript Strict | Zero `any`, validasi kontrak data terpusat di `src/types/` |

---

## Struktur Folder

```text
pertemuan-6/
├── assets/                  # Asset grafis, ikon, dan splash screen
├── docs/
│   └── SRS.md              # Software Requirements Specification (v1.2)
├── src/
│   ├── app/                # Layar aplikasi (Expo Router)
│   │   ├── _layout.tsx     # Root stack layout
│   │   ├── index.tsx       # Layar pemilihan peran & identitas
│   │   ├── asisten/        # Alur layar asisten (daftar, buat, rekap)
│   │   └── praktikan/      # Alur layar praktikan (jadwal, presensi, riwayat)
│   ├── components/         # Design system & modular UI Kit
│   │   ├── session/        # Komponen spesifik domain (SessionCard, StatusBadge, SessionInfo)
│   │   └── ui/             # Komponen primitif (Button, TextField, Card, BottomSheet, Screen)
│   ├── data/
│   │   └── dummy.ts        # Fixture data asisten, praktikan, dan jadwal kelas
│   ├── store/
│   │   └── appStore.ts     # Zustand store, actions, selectors, dan hook useRekap
│   ├── theme/              # Desain token semantik
│   │   ├── colors.ts       # Palet warna dengan rasio kontras WCAG terverifikasi
│   │   ├── spacing.ts      # Skala layout, radius sudut, dan touch targets
│   │   └── typography.ts   # Skala tipografi responsif
│   ├── types/
│   │   └── index.ts        # Kontrak tipe data (User, Session, Attendance, Rekap)
│   └── utils/
│       ├── id.ts           # Generator ID unik dan generator kode sesi 4 digit
│       └── time.ts         # Formatter waktu ISO UTC dan parsing jam
├── app.json                # Konfigurasi metadata Expo
├── package.json            # Daftar dependensi modul
└── tsconfig.json           # Konfigurasi TypeScript path aliases (@/*)
```

---

## Panduan Memulai

### Prasyarat

- [Node.js](https://nodejs.org/) (versi LTS direkomendasikan, v20+)
- [Expo Go](https://expo.dev/go) di perangkat fisik atau emulator Android Studio

### Instalasi

1. Clone repositori:
   ```bash
   git clone https://github.com/PPK-01/pertemuan-6.git
   cd pertemuan-6
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

### Menjalankan Aplikasi

- **Dev Server Metro:**
  ```bash
  npx expo start
  ```
- **Jalankan di Web Preview:**
  ```bash
  npx expo start --web
  ```
- **Jalankan di Android Emulator:**
  ```bash
  npx expo start --android
  ```

### Verifikasi Kualitas Kode

Jalankan type-check sebelum membuat commit atau pull request:
```bash
npx tsc --noEmit
```

---

## Konvensi Desain & Standar UI

Sesuai dengan panduan teknis pada dokumen SRS:

1. **Lightweight & Native:** Tidak menggunakan library UI pihak ketiga yang berat (seperti Paper, NativeBase, atau Tamagui). Seluruh komponen dibangun menggunakan primitif React Native dan `StyleSheet`.
2. **Kontras & Keterbacaan:** Semua kombinasi warna teks dan latar mematuhi standar rasio kontras minimal **4.5:1** (WCAG AA).
3. **Sentuhan Ramah Jari:** Seluruh elemen interaktif memiliki target sentuh minimal **44x44 dp**.
4. **Respon Keyboard:** Form dan layar input dilindungi oleh `KeyboardAvoidingView` dinamis untuk mencegah input tertutup keyboard virtual.

---

## Tim Pengembang & Pembagian Tugas

- **Dhimas** — Project Manager (Koordinasi sprint, review kepatuhan SRS, rilis)
- **Ibrahim** — Software Engineer (State store Zustand, alur layar Praktikan, validasi presensi)
- **Elang** — Software Engineer (Design system UI Kit, alur layar Asisten, responsivitas)

---

## Referensi Terkait

- [Dokumentasi Lengkap SRS (Software Requirements Specification)](docs/SRS.md)
- [Dokumentasi Resmi Expo SDK 57](https://docs.expo.dev/)
- [Dokumentasi Expo Router](https://docs.expo.dev/router/introduction/)
- [Dokumentasi Zustand State Management](https://docs.pmnd.rs/zustand/getting-started/introduction)
