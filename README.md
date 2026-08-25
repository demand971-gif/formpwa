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

## Open the files

On your computer, keep this folder together. Open `index.html` from the folder, or serve the folder locally if your browser blocks local media:

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000/` on that same machine. Do not treat that as a public live site.

## Data

Favorites, workout log, PRs, and reminders stay on the device that runs the files. Use **Tools → Backup** in the UI to export or restore a JSON backup.

## GitHub

This project is intended as a **private** source repo (`form-gym-pwa`). Do not enable GitHub Pages.
