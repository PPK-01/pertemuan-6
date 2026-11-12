# Presensi Praktikum Rawuh - Sprint 2 (Dhimas: Fondasi Data, Auth, AI & Praktikan)

Dokumen ini merangkum panduan konfigurasi, arsitektur, dan pengujian untuk lingkup kerja **Dhimas** pada Sprint 2 aplikasi Presensi Praktikum **Rawuh** (React Native + Firebase + AI). Dokumen kebutuhan perangkat lunak mengacu pada `docs/SRS & Rencana Kerja Sprint 2 Aplikasi Presensi Praktikum Rawuh (React Native + F.md`.

---

## 1. Cakupan Tugas Dhimas (D-01 s.d. D-12)

1. **D-01 & D-02**: Fondasi Firebase Modular JS SDK (`firebase`), konfigurasi `src/config/env.ts`, safe wrapper untuk storage dan network connectivity.
2. **D-03**: Pembaruan kontrak tipe `src/types/index.ts` (Sprint 2) dan store terpadu `src/store/appStore.ts`.
3. **D-04**: Firebase Security Rules (`firestore.rules`), `firestore.indexes.json`, `firebase.json` dengan pengujian 9 kasus keamanan.
4. **D-05**: Sistem Autentikasi Firebase (`services/auth.ts`, `services/users.ts`), gate rute per peran, layar `login.tsx` & `daftar.tsx`, serta `KeluarButton`.
5. **D-06**: Sinkronisasi Firestore Realtime (`store/sync.ts`), listener per peran, mapping error Indonesia (`services/errors.ts`), timeout 10 detik, dan penanganan offline.
6. **D-07**: Layanan Sesi & Kelas (`services/sessions.ts`, `services/kelas.ts`) dengan pemisahan kode 4 digit ke subdokumen `private/code`.
7. **D-08**: Alur Presensi Praktikan: validasi kode sesi, pra-cek offline/sesi/kelas/duplikasi, rekaman waktu server, dan tab Riwayat dengan ringkasan kehadiran & izin.
8. **D-09**: Fitur Pengajuan Izin Praktikan: validasi alasan (10–500 karakter), penyimpanan `izin/{sessionId}_{uid}`, tab Izin, dan layar detail izin.
9. **D-10**: Integrasi AI (`services/ai.ts`): klasifikasi alasan izin dengan timeout 15 detik, penanganan respons toleran, dan error handling tanpa crash.
10. **D-11**: Logika rekapitulasi `computeRekap` yang memperhitungkan izin disetujui (FR-10, FR-28).
11. **D-12**: Dokumentasi teknis proyek.

---

## 2. Arsitektur Dual-Mode Runtime

Aplikasi dirancang dengan **Dual-Mode Engine**:
1. **Mode Firebase Cloud (Produksi / Staging)**: Aktif otomatis saat variabel `EXPO_PUBLIC_FIREBASE_*` diisi di file `.env`. Terhubung langsung ke Firebase Authentication dan Cloud Firestore secara realtime.
2. **Mode In-Memory Fallback (Lokal / Emulator)**: Aktif otomatis jika `.env` belum diisi. Memungkinkan emulator Android dan web langsung dijalankan untuk menguji alur auth, presensi, dan izin tanpa crash.

---

## 3. Konfigurasi Lingkungan (`.env`)

Salin berkas `.env.example` menjadi `.env` lalu lengkapi variabel berikut:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI API Integration
EXPO_PUBLIC_AI_URL=https://api.pengajar.ac.id/v1/classify-izin
EXPO_PUBLIC_AI_KEY=your_ai_api_key
```

> **Catatan Keamanan:** Berkas `.env` telah didaftarkan di `.gitignore` dan dilarang untuk di-commit ke repositori.

---

## 4. Menjalankan Aplikasi

### A. Android Dev Client / Emulator
Jalankan skrip otomasi emulator yang sudah tersedia:
```bash
./run-android.sh
```
Atau mulai development server Metro:
```bash
npx expo start --dev-client
```

### B. Pengujian Web
```bash
npx expo start --web
```

### C. Verifikasi Kualitas Kode
```bash
npx tsc --noEmit
```

---

## 5. Peta Route Sprint 2 (Area Tanggung Jawab Dhimas)

| Route | File Komponen | Deskripsi |
| :--- | :--- | :--- |
| `/` | `src/app/index.tsx` | Gate utama: mengarahkan user berdasarkan auth status & peran |
| `/(auth)/login` | `src/app/(auth)/login.tsx` | Form masuk (Email & Kata Sandi) |
| `/(auth)/daftar` | `src/app/(auth)/daftar.tsx` | Form registrasi peran Praktikan / Asisten Lab |
| `/praktikan/jadwal` | `src/app/praktikan/(tabs)/jadwal.tsx` | Daftar jadwal sesi kelas praktikan secara realtime |
| `/praktikan/izin` | `src/app/praktikan/(tabs)/izin.tsx` | Daftar pengajuan izin praktikan dan status verifikasi |
| `/praktikan/riwayat` | `src/app/praktikan/(tabs)/riwayat.tsx` | Riwayat presensi dan ringkasan hadir & izin disetujui |
| `/praktikan/sesi/[id]` | `src/app/praktikan/sesi/[id].tsx` | Detail sesi, form presensi 4 digit, dan tombol ajukan izin |
| `/praktikan/izin/baru` | `src/app/praktikan/izin/baru.tsx` | Form pengajuan izin (alasan 10–500 karakter) |
| `/praktikan/izin/[id]` | `src/app/praktikan/izin/[id].tsx` | Detail izin: status, alasan, dan keputusan asisten |

---

## 6. Firebase Security Rules (`firestore.rules`)

Aturan keamanan menerapkan prinsip *deny-by-default*:
- `users/{uid}`: Hanya pemilik yang dapat membuat dokumen akunnya sendiri; asisten wajib menyertakan kode undangan yang diverifikasi server.
- `sessions/{id}`: Praktikan hanya dapat membaca sesi untuk kelasnya; kode 4 digit sesi disimpan di subdokumen `private/code` yang hanya dapat dibaca asisten.
- `attendances/{sessionId}_{uid}`: Praktikan hanya dapat menulis presensi saat sesi berstatus `open`, kelas sesuai, kode cocok, belum presensi, dan tidak memiliki izin yang telah disetujui. ID dokumen deterministik `{sessionId}_{uid}` mencegah duplikasi presensi di level database.
- `izin/{sessionId}_{uid}`: Praktikan mengajukan izin dengan status awal `pending_ai`. Asisten adalah satu-satunya pihak yang berhak mengubah status menjadi `approved` atau `rejected` melalui field `review`.

Untuk mendeploy rules:
```bash
firebase deploy --only firestore:rules
```

---

## 7. Akun Seed Uji Coba

Untuk keperluan demo dan verifikasi:
- **Asisten**: `dina@rawuh.ac.id`, `raka@rawuh.ac.id` (Kata sandi bebas pada mode fallback)
- **Praktikan (Kelas A)**: `bagas@rawuh.ac.id`, `citra@rawuh.ac.id`
- **Praktikan (Kelas B)**: `dani@rawuh.ac.id`, `eka@rawuh.ac.id`
- **Kode Undangan Asisten**: `LAB-RAWUH-2026`
