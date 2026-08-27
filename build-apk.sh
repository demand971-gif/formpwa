#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANDROID_DIR="$ROOT_DIR/android"
BUILD_TYPE="${1:-debug}"

echo "=========================================="
echo " FORM — Build Android APK"
echo " Build Type: $BUILD_TYPE"
echo "=========================================="

# 1. Check for Node.js
if ! command -v node >/dev/null 2>&1; then
    echo ""
    echo "[!] Error: 'node' is not found in PATH."
    echo "    Please install Node.js 20 or higher to build the APK."
    exit 1
fi

# 2. Build the web app (Vite) and sync dist/ into Android assets
"$ROOT_DIR/scripts/sync-assets.sh"

# 3. Check for Java
if ! command -v java >/dev/null 2>&1; then
    echo ""
    echo "[!] Error: 'java' is not found in PATH."
    echo "    Please install OpenJDK 17 or higher to build the APK."
    echo "    Alternatively, open the 'android' folder in Android Studio"
    echo "    or use the GitHub Actions build workflow."
    exit 1
fi

# 4. Check for Android SDK
if [ -z "${ANDROID_HOME:-}" ] && [ -z "${ANDROID_SDK_ROOT:-}" ]; then
    # Try standard locations
    if [ -d "$HOME/Android/Sdk" ]; then
        export ANDROID_HOME="$HOME/Android/Sdk"
    elif [ -d "$HOME/Library/Android/sdk" ]; then
        export ANDROID_HOME="$HOME/Library/Android/sdk"
    else
        echo ""
        echo "[!] Notice: ANDROID_HOME is not set."
        echo "    Gradle will attempt to find or download the Android SDK."
    fi
fi

# 5. Build APK with Gradle
cd "$ANDROID_DIR"
chmod +x gradlew

if [ "$BUILD_TYPE" = "release" ]; then
    echo "==> Building Release APK..."
    ./gradlew assembleRelease
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release.apk"
    if [ ! -f "$APK_PATH" ]; then
        APK_PATH="$ANDROID_DIR/app/build/outputs/apk/release/app-release-unsigned.apk"
    fi
else
    echo "==> Building Debug APK..."
    ./gradlew assembleDebug
    APK_PATH="$ANDROID_DIR/app/build/outputs/apk/debug/app-debug.apk"
fi

if [ -f "$APK_PATH" ]; then
    OUTPUT_APK="$ROOT_DIR/FORM-$BUILD_TYPE.apk"
    cp -f "$APK_PATH" "$OUTPUT_APK"
    echo ""
    echo "=========================================="
    echo " [✓] Build Successful!"
    echo " APK output: $OUTPUT_APK"
    echo " Size: $(du -h "$OUTPUT_APK" | cut -f1)"
    echo "=========================================="
else
    echo ""
    echo "[!] Build finished, check $ANDROID_DIR/app/build/outputs/apk/ for outputs."
fi
