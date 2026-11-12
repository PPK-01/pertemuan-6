#!/bin/bash
set -e

# ==============================================================================
# Script otomatisasi Android Emulator & App Runner (Expo Dev Client)
# Project: pertemuan-6 (com.laangid.pertemuan6)
# ==============================================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

# 1. Setup Environment
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Library/Android/sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools:$PATH"

if [ -z "$JAVA_HOME" ] && [ -d "/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home" ]; then
  export JAVA_HOME="/opt/homebrew/Cellar/openjdk@21/21.0.11/libexec/openjdk.jdk/Contents/Home"
  export PATH="$JAVA_HOME/bin:$PATH"
fi

AVD_NAME="tiny"
APK_PATH="$PROJECT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
PACKAGE_NAME="com.laangid.pertemuan6"
SCHEME_URL="exp+pertemuan-6://expo-development-client/?url=http%3A%2F%2F127.0.0.1%3A8081"

# Parse CLI flags
FORCE_BUILD=0
for arg in "$@"; do
  if [ "$arg" = "--build" ] || [ "$arg" = "-b" ]; then
    FORCE_BUILD=1
  fi
done

echo "📱 [1/5] Memeriksa Android Emulator ($AVD_NAME)..."
DEVICE_BOOTED=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')

if [ "$DEVICE_BOOTED" != "1" ]; then
  echo "🚀 Menjalankan emulator '$AVD_NAME' di background..."
  nohup emulator -avd "$AVD_NAME" -no-snapshot-save -no-boot-anim </dev/null >/dev/null 2>&1 &
  
  echo "⏳ Menunggu emulator selesai booting..."
  adb wait-for-device
  until [ "$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; do
    sleep 2
  done
  echo "✅ Emulator '$AVD_NAME' siap!"
else
  echo "✅ Emulator sudah aktif dan siap digunakan."
fi

# 2. Reverse Port Metro
echo "🔌 [2/5] Mengatur adb reverse port 8081..."
adb reverse tcp:8081 tcp:8081

# 3. Cek Metro Bundler
echo "⚡ [3/5] Memeriksa Metro Bundler..."
if ! lsof -i :8081 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "📦 Menjalankan Metro Bundler (expo start --dev-client)..."
  nohup npx expo start --dev-client </dev/null >/dev/null 2>&1 &
  sleep 4
  echo "✅ Metro Bundler berjalan di port 8081."
else
  echo "✅ Metro Bundler sudah aktif di port 8081."
fi

# 4. Build APK jika belum ada atau dipaksa via flag --build / REBUILD=1
if [ ! -f "$APK_PATH" ] || [ "$FORCE_BUILD" -eq 1 ] || [ "$REBUILD" = "1" ]; then
  echo "🔨 [4/5] Melakukan build APK debug (Gradle assembleDebug - arm64 single arch)..."
  if [ ! -d "$PROJECT_DIR/android" ]; then
    npx expo prebuild --platform android --no-install
    echo "sdk.dir=$ANDROID_HOME" > "$PROJECT_DIR/android/local.properties"
    sed -i '' 's/reactNativeArchitectures=.*/reactNativeArchitectures=arm64-v8a/' "$PROJECT_DIR/android/gradle.properties" 2>/dev/null || true
    echo "org.gradle.caching=true" >> "$PROJECT_DIR/android/gradle.properties"
  fi
  cd "$PROJECT_DIR/android"
  ./gradlew assembleDebug
  cd "$PROJECT_DIR"
  echo "✅ Build APK selesai: $APK_PATH"
else
  echo "⏩ [4/5] APK sudah tersedia di: $APK_PATH (lewati build native)"
fi

# 5. Cek apakah app sudah terinstall di emulator
IS_INSTALLED=$(adb shell pm list packages "$PACKAGE_NAME" 2>/dev/null | grep -w "package:$PACKAGE_NAME" || true)

if [ -z "$IS_INSTALLED" ] || [ "$FORCE_BUILD" -eq 1 ] || [ "$REBUILD" = "1" ]; then
  echo "📲 [5/5] Menginstall APK ke emulator..."
  adb install -r "$APK_PATH"
else
  echo "⏩ [5/5] Aplikasi '$PACKAGE_NAME' sudah terinstall di emulator (lewati install ulang)"
fi

echo "🚀 Membuka aplikasi di emulator..."
adb shell am start -a android.intent.action.VIEW -d "$SCHEME_URL" >/dev/null 2>&1 || \
adb shell monkey -p "$PACKAGE_NAME" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1

echo "🎉 Aplikasi '$PACKAGE_NAME' aktif!"
echo "✨ Fast Refresh aktif: setiap edit kode di folder 'src/' akan langsung ter-update otomatis dalam milidetik tanpa rebuild."
echo "💡 Tekan 'Cmd + M' atau double-tap 'R' di emulator untuk Dev Menu."
