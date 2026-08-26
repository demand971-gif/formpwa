# FORM Mobile App — Standalone Android APK

Similar to **openGym**, FORM is built with a **local-first, privacy-respecting architecture**:

| | **Local File / PWA** | **Standalone Android App (APK)** |
|---|---|---|
| **Runs** | In any modern desktop/mobile browser | Natively on Android via high-performance WebView shell |
| **Accounts** | None required | None required — the device is your account |
| **Data & Logs** | Stored locally in `localStorage` | Stored persistently in app data storage (`DOMStorage` / `IndexedDB`) |
| **Screen State** | Dependent on browser wake locks | Hardware screen kept active (`FLAG_KEEP_SCREEN_ON`) during workouts |
| **Media & Exercises** | Local files (`media/`) | Embedded offline assets (`android/app/src/main/assets/`) |
| **YouTube Cues** | Embedded / external tabs | Embedded video modal or routed to native YouTube app via Android Intents |
| **Telemetry & Ads** | None | 100% telemetry-free, ad-free, and offline-capable |

---

## Prerequisites

- **Java Development Kit:** OpenJDK 17 or 21
- **Android SDK:** Command-line tools or **Android Studio** (API level 34 recommended)

---

## Build & Packaging Options

### Option 1: One-Click Build Script

From the repository root:

```bash
# Build Debug APK:
./build-apk.sh debug

# Build Release APK:
./build-apk.sh release
```

The script automatically syncs all web assets, compiles the project, and places the final APK (`FORM-debug.apk` or `FORM-release.apk`) directly in the project root.

---

### Option 2: Building with Gradle Wrapper

```bash
# 1. Sync latest assets into Android project
./scripts/sync-assets.sh

# 2. Compile APK
cd android
./gradlew assembleDebug      # Output: app/build/outputs/apk/debug/app-debug.apk
./gradlew assembleRelease    # Output: app/build/outputs/apk/release/app-release-unsigned.apk
```

---

### Option 3: Signing the Release APK (for Sideloading)

To produce a production-ready signed APK for distribution or personal sideloading:

```bash
# Step 1: Generate your private keystore (one-time)
keytool -genkeypair -v -keystore form-release.keystore -alias form -keyalg RSA -keysize 2048 -validity 10000

# Step 2: Align the APK (4-byte alignment)
zipalign -v -p 4 android/app/build/outputs/apk/release/app-release-unsigned.apk form-aligned.apk

# Step 3: Sign the APK using apksigner
apksigner sign --ks form-release.keystore --ks-key-alias form --out FORM-signed.apk form-aligned.apk

# Step 4: Verify signature
apksigner verify -v FORM-signed.apk
```

---

### Option 4: Android Studio (GUI)

1. Launch **Android Studio**.
2. Select **Open** and choose the `android/` directory.
3. Allow Gradle sync to complete.
4. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
5. Connect your Android device via USB (with Developer Options & USB Debugging enabled) and click **Run** (Shift+F10).

---

### Option 5: Sideloading & Installing via ADB

```bash
# Install the APK to your connected Android phone or emulator:
adb install -r FORM-debug.apk
```

Or transfer `FORM-debug.apk` directly to your phone via USB, Google Drive, or local share, and tap the APK in your phone's file manager to install.
