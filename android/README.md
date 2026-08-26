# FORM Android Project

Native Android wrapper for the FORM gym training app using Android WebView.

## Architecture

- **Asset Loader**: Uses modern `androidx.webkit.WebViewAssetLoader` to serve web assets securely under `https://appassets.androidplatform.net/assets/index.html` (with seamless fallback to `file:///android_asset/index.html`).
- **Offline Storage**: HTML5 `localStorage` and `IndexedDB` are enabled and persistent so workouts, PRs, logs, and settings remain on the device.
- **Media Playback**: Configured to allow automatic playback of exercise demonstration GIFs, MP4s, and timer audio without requiring extra gestures.
- **Navigation**:
  - Internal links and hash navigation run inside the WebView.
  - External links (e.g. YouTube tutorial cues) launch in the device's YouTube app or default browser via Android `Intent`.
  - Android system back button is integrated with WebView history navigation.
- **Theme**: Status bar and navigation bar match the dark theme (`#171816`).
- **Screen Awake**: Keeps screen on during active workout sessions so timers aren't interrupted.

## How to Build

### Option 1: Using Android Studio (Recommended)

1. Open **Android Studio**.
2. Select **Open** and choose the `android` directory in this repository.
3. Android Studio will automatically sync Gradle and download dependencies.
4. Select **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
5. The generated APK will be in `app/build/outputs/apk/debug/app-debug.apk`.
6. To run directly on a connected device or emulator, press **Run (Shift+F10)**.

### Option 2: Command Line (with Gradle & Android SDK)

Ensure Java 17 and Android SDK are installed, then run:

```bash
# From the project root:
./build-apk.sh debug

# Or for release:
./build-apk.sh release
```

Alternatively, from the `android` directory:

```bash
cd android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Option 3: Automated via GitHub Actions

This repository includes `.github/workflows/build-apk.yml`. Whenever changes are pushed:
1. GitHub Actions automatically sets up Java 17 and the Android SDK.
2. Syncs the web assets.
3. Builds both Debug and Release APKs.
4. Uploads them as downloadable artifacts under the **Actions** tab of the repository (`FORM-APK.zip` containing `FORM-debug.apk` and `FORM-release.apk`).

## Updating Web Assets

When changes are made to `index.html`, `media/`, or `icons/`, run:

```bash
./scripts/sync-assets.sh
```

Or run `./build-apk.sh`, which automatically syncs assets before compilation.
