# Fast Refresh Workflow and Native Build Optimization for Apple Silicon

## Context
Proses kompilasi native pertama (`./gradlew assembleDebug`) membutuhkan waktu cukup lama karena React Native New Architecture mengompilasi biner C++ untuk empat arsitektur target sekaligus (`armeabi-v7a`, `arm64-v8a`, `x86`, `x86_64`) dengan alokasi heap JVM standar (2GB) dan tanpa Gradle build caching. Selain itu, terdapat kekhawatiran bahwa setiap perubahan kode aplikasi mengharuskan kompilasi ulang APK.

## Decision
1. **Pemisahan Siklus Dev Harian dan Native Build**:
   - Pengembangan sehari-hari (UI, logika, navigasi, state di `src/`) menggunakan **Fast Refresh** melalui Metro bundler. Kode diperbarui secara instan lewat WebSocket (<1 detik) tanpa build ulang APK.
   - Native build (`./gradlew assembleDebug`) hanya dilakukan saat ada perubahan dependensi native di `package.json` atau konfigurasi `android/`.

2. **Optimasi Native Build di `android/gradle.properties`**:
   - Membatasi target kompilasi biner C++ hanya pada `arm64-v8a` (`reactNativeArchitectures=arm64-v8a`), sesuai dengan chip Apple Silicon dan system image emulator lokal.
   - Mengaktifkan `org.gradle.caching=true` untuk caching artefak task Gradle antar-build.
   - Meningkatkan memori JVM Gradle daemon menjadi 4GB (`-Xmx4096m -XX:MaxMetaspaceSize=1024m`).

3. **Otomatisasi Cepat di `run-android.sh`**:
   - Memeriksa apakah aplikasi sudah terpasang di emulator (`pm list packages`).
   - Melewati proses streaming instalasi APK jika aplikasi sudah ada dan tidak ada flag `--build`. Waktu startup harian dipangkas menjadi <3 detik.

## Consequences
- Siklus edit kode dan preview menjadi instan (<1 detik via Fast Refresh).
- Durasi kompilasi native (saat diperlukan) terpangkas hingga ~70% karena hanya memproses satu arsitektur dan memanfaatkan build cache.
- Ukuran file APK debug menjadi jauh lebih ramping karena tidak lagi menyertakan slice binary x86 dan 32-bit arm.
- Jika di masa depan dibutuhkan APK universal/multi-arsitektur untuk rilis produksi ke berbagai tipe device fisik, konfigurasi `reactNativeArchitectures` dapat disesuaikan kembali atau di-override via CLI.
