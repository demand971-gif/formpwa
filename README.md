# FORM

Source files for the FORM gym training project. This repository is **not** a hosted website and is **not** published as a PWA.

It is a private file collection: the training UI, programs, media, and related assets.

## Contents

| Path | What it is |
| --- | --- |
| `index.html` | Training UI, programs, timer, tools |
| `media/` | Exercise pictures, GIFs, videos |
| `icons/` | App icons |
| `manifest.json` | Install metadata (kept as source only) |
| `sw.js` | Service-worker source (not required) |
| `offline.html` | Offline fallback source |
| `android/` | Android project wrapper (ready for APK packaging) |
| `build-apk.sh` | Automated build script for Android APK |
| `.github/workflows/build-apk.yml` | CI workflow to build APKs automatically |

## Open the files

On your computer, keep this folder together. Open `index.html` from the folder, or serve the folder locally if your browser blocks local media:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/` on that same machine. Do not treat that as a public live site.

## Packaging as Android APK

The project includes a production-ready Android wrapper in `android/` with full offline asset support, persistent local storage, custom app icons, back-button handling, and YouTube cues intent routing.

### 1. Build via Android Studio
1. Open Android Studio and select **Open**.
2. Select the `android/` directory in this repo.
3. Click **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
4. Locate the built APK in `android/app/build/outputs/apk/debug/app-debug.apk`.

### 2. Build via Command Line
If you have Java 17 and the Android SDK installed:

```bash
# Build debug APK:
./build-apk.sh debug

# Build release APK:
./build-apk.sh release
```

### 3. Automated via GitHub Actions
A GitHub Actions workflow is included in `.github/workflows/build-apk.yml`. Pushing to your repository triggers an automated build that generates and uploads downloadable `FORM-debug.apk` and `FORM-release.apk` artifacts under the GitHub repository's **Actions** tab.

## Data

Favorites, workout log, PRs, and reminders stay on the device that runs the files. Use **Tools → Backup** in the UI to export or restore a JSON backup.

## GitHub

This project is intended as a **private** source repo (`form-gym-pwa`). Do not enable GitHub Pages.
