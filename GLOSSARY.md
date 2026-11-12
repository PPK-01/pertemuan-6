# Presensi Praktikum Rawuh

Aplikasi presensi praktikum laboratorium berbasis mobile (React Native & Expo) dengan verifikasi kode 4 digit, sinkronisasi realtime Cloud Firestore, dan klasifikasi pengajuan izin berbasis AI.

## Language

**Sesi Praktikum**:
Kegiatan pertemuan praktikum untuk suatu kelas pada rentang waktu tertentu dengan topik dan ruang laboratorium spesifik.
_Avoid_: Jadwal, pertemuan, kelas (bila merujuk ke acara/waktu)

**Status Sesi**:
Siklus hidup sesi praktikum: `scheduled` (Dijadwalkan), `open` (Dibuka untuk presensi), dan `closed` (Ditutup/arsip).
_Avoid_: Aktif, non-aktif, selesai

**Kode Sesi**:
Kode otentikasi numerik 4 digit acak yang wajib dimasukkan praktikan saat sesi dibuka untuk membuktikan kehadiran fisik di laboratorium.
_Avoid_: PIN, password sesi, token presensi

**Presensi**:
Pencatatan kehadiran praktikan pada sesi yang sedang dibuka dengan kode yang valid dan terekam dengan timestamp server.
_Avoid_: Absensi, check-in, kehadiran (sebagai aksi)

**Izin**:
Pengajuan ketidakhadiran resmi yang diajukan oleh praktikan untuk suatu sesi dengan menyertakan alasan tertulis.
_Avoid_: Dispensasi, cuti, surat sakit

**Status Izin**:
Tahapan pemrosesan pengajuan izin: `pending_ai` (menunggu analisis awal AI), `pending_review` (menunggu verifikasi asisten), `approved` (disetujui oleh asisten), dan `rejected` (ditolak oleh asisten).
_Avoid_: Draft, diproses, selesai

**Saran AI**:
Rekomendasi klasifikasi kategori dan saran kelayakan (diterima/ditolak) dari model AI yang disajikan kepada asisten laboratorium sebagai bahan pertimbangan.
_Avoid_: Keputusan AI, auto-approval, vonis AI

**Keputusan Asisten**:
Penetapan status akhir izin (`approved` atau `rejected`) beserta catatan penjelas yang dilakukan secara mutlak oleh asisten laboratorium.
_Avoid_: Konfirmasi, review AI, persetujuan sistem

**Rekapitulasi (Rekap)**:
Ringkasan keterisian presensi satu sesi yang mengelompokkan praktikan terdaftar menjadi tiga kelompok saling lepas: Hadir, Izin (disetujui), dan Belum Hadir.
_Avoid_: Laporan absensi, rekapitulasi kehadiran

**Kode Undangan Asisten**:
Kunci rahasia pendaftaran akun dengan peran Asisten Laboratorium yang diverifikasi langsung oleh Firebase Security Rules.
_Avoid_: Token registrasi, invite code publik

---

# Tooling & Runtime Environment

Konvensi lingkungan pengujian lokal dan otomasi build emulator Android.

## Language

**Fast Refresh**:
Mekanisme pembaruan kode instan berbasis WebSocket yang merefleksikan perubahan JavaScript/TypeScript di emulator tanpa kompilasi ulang native.

**Expo Dev Client**:
Binary aplikasi Android debug kustom (`app-debug.apk`) yang memuat seluruh modul native, runtime C++, dan engine Hermes sebagai container pengembangan.

**Metro Bundler**:
Development server lokal (port 8081) yang mengompilasi dan mentransmisikan bundle kode JavaScript/TypeScript ke aplikasi.

**Native Rebuild**:
Proses kompilasi penuh menggunakan Gradle (`./gradlew assembleDebug`) yang hanya diperlukan saat terjadi penambahan modul native pihak ketiga atau perubahan konfigurasi Android.

**Single-Arch Target**:
Konfigurasi kompilasi native yang dibatasi pada target instruksi arsitektur prosesor `arm64-v8a` untuk efisiensi kompilasi pada Apple Silicon.
